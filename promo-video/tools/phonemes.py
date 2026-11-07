"""Phoneme-level QA for narration: transcribe audio to IPA with wav2vec2 (espeak phone set)."""
import subprocess, sys
import numpy as np
import torch
from transformers import AutoProcessor, Wav2Vec2ForCTC

MODEL = "facebook/wav2vec2-xlsr-53-espeak-cv-ft"
_proc = _model = None


def load():
    global _proc, _model
    if _model is None:
        _proc = AutoProcessor.from_pretrained(MODEL)
        _model = Wav2Vec2ForCTC.from_pretrained(MODEL).eval()
    return _proc, _model


def read16k(path, start=None, end=None):
    cmd = ["ffmpeg", "-v", "error"]
    if start is not None:
        cmd += ["-ss", f"{start:.3f}"]
    cmd += ["-i", path]
    if end is not None and start is not None:
        cmd += ["-t", f"{end - start:.3f}"]
    cmd += ["-f", "f32le", "-ac", "1", "-ar", "16000", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, dtype=np.float32)


def phonemes(path, start=None, end=None):
    proc, model = load()
    audio = read16k(path, start, end)
    inputs = proc(audio, sampling_rate=16000, return_tensors="pt")
    with torch.no_grad():
        logits = model(inputs.input_values).logits
    ids = torch.argmax(logits, dim=-1)
    return proc.batch_decode(ids)[0]


if __name__ == "__main__":
    torch.set_num_threads(16)
    for p in sys.argv[1:]:
        print(f"{p.split('/')[-1]:34s} {phonemes(p)}")


def phonemes_array(audio16k):
    """Same as phonemes(), for a float32 mono array at 16 kHz."""
    proc, model = load()
    inputs = proc(audio16k, sampling_rate=16000, return_tensors="pt")
    with torch.no_grad():
        logits = model(inputs.input_values).logits
    return proc.batch_decode(torch.argmax(logits, dim=-1))[0]
