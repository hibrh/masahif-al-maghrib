#!/usr/bin/env python3
"""Check the Arabic narration: the stops in the script, what the voice says, and how it ends each stop.

    ~/.venvs/media/bin/python tools/qa_voice.py            # every Arabic segment
    ~/.venvs/media/bin/python tools/qa_voice.py a4 a7      # some of them

The voice must never stop on a vowel (الوقف لا يكون على متحرك, see tools/waqf.py):
1. The script: a word before a pause whose `say` still ends on a short vowel or
   tanween is reported, with its pausal form.
2. Whisper large-v3 transcribes each segment in build/voice/ar/; its words are
   compared with the caption, letters only.
3. A phoneme recognizer (wav2vec2, espeak phone set) transcribes each word that
   ends at a pause and prints its last phones. A stop should end on a consonant,
   or on a long vowel where the word ends in ا, و or ي; ⚠ marks a short vowel.
"""
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import waqf  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
MARKS = re.compile("[ً-ْٰـ]")
SHORT = {"a", "i", "u", "e", "o", "ə", "ɐ", "ɪ", "ʊ", "æ", "ɛ", "ɔ"}


def norm(w):
    w = MARKS.sub("", w)
    w = re.sub("[إأآٱ]", "ا", w).replace("ة", "ه").replace("ى", "ي")
    return re.sub(r"[^\w]", "", w)


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def stops(say):
    """(index, word) of every word before a pause, and of the last word."""
    toks = say.split()
    out = []
    for n, tok in enumerate(toks):
        _, core, trail = waqf.split_token(tok)
        if n == len(toks) - 1 or any(c in waqf.PAUSE_PUNCT for c in trail):
            out.append((n, core))
    return out


def main(only):
    script = json.loads((ROOT / "voice" / "script.ar.json").read_text(encoding="utf-8"))
    segs = [s for s in script["segments"] if not only or s["id"] in only]
    print("== the script's stops")
    bad = 0
    for seg in segs:
        for n, core in stops(seg["say"]):
            p = waqf.pausal(core)
            if p != core and re.search("[ء-ي]", core):
                bad += 1
                print(f"   {seg['id']} word {n}: «{core}» stops on a vowel; pausal form «{p}»")
    if not bad:
        print("   every stop is in pausal form")

    from faster_whisper import WhisperModel
    import phonemes as ph
    model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=24)
    vdir = ROOT / "build" / "voice" / "ar"
    for seg in segs:
        meta = json.loads((vdir / f"{seg['id']}.json").read_text(encoding="utf-8"))
        audio = load(vdir / f"{seg['id']}.mp3")
        res, _ = model.transcribe(audio, language="ar", beam_size=5, vad_filter=False,
                                  condition_on_previous_text=False)
        heard = " ".join(s.text for s in res).split()
        shown = (seg.get("show") or MARKS.sub("", seg["say"])).split()
        a, b = [norm(x) for x in shown], [norm(x) for x in heard]
        sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
        diffs = [(" ".join(shown[i1:i2]), " ".join(heard[j1:j2]))
                 for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal"]
        print(f"\n{'OK' if not diffs else '??'} {seg['id']} heard: {' '.join(heard)}")
        for want, got in diffs:
            print(f"      caption «{want}»  ≠  heard «{got}»")
        words, toks = meta["words"], seg["say"].split()
        if len(words) != len(toks):
            print(f"      ({len(words)} timed words for {len(toks)} written: stops not checked)")
            continue
        out = []
        for n, core in stops(seg["say"]):
            # the voice's word end is often early: listen on to the next word, or 0.35 s at the end
            w = words[n]
            end = words[n + 1]["start"] if n + 1 < len(words) else w["end"] + 0.35
            clip = audio[int(w["start"] * 16000): int(end * 16000)]
            phones = ph.phonemes_array(clip).split()
            flag = " ⚠" if phones and phones[-1] in SHORT else ""
            out.append(f"{core} → …{' '.join(phones[-5:])}{flag}")
        print("      stops: " + "  |  ".join(out))


if __name__ == "__main__":
    main(set(sys.argv[1:]))
