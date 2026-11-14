#!/usr/bin/env python3
"""Transcribe the final videos with Whisper and compare them with the script.

    python tools/verify_asr.py ar en ar-teaser en-teaser

Uses faster-whisper large-v3 from the Hugging Face cache. The sound is decoded
with ffmpeg and passed as an array (PyAV's decoder failed on these files).
Diacritics, hamza forms and punctuation are ignored; every remaining difference
between the script and what Whisper heard is printed. Whisper writes numbers as
digits and sometimes misses the last line under the end card: listen to those.
"""
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parent.parent
TASHKEEL = re.compile("[ً-ْٰـ]")


def norm(s):
    s = TASHKEEL.sub("", s).lower()
    s = s.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ة", "ه").replace("ى", "ي")
    s = s.replace("-", " ").replace(".com", " com")
    s = re.sub("[،؛؟۔]", " ", s)
    return re.findall(r"[\w؀-ۿ]+", s)


def main(ids):
    model = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=24)
    for cid in ids:
        lang = cid.split("-")[0]
        cut = cid.split("-", 1)[1] if "-" in cid else "full"
        tl = json.loads((ROOT / "scene" / f"timeline.{cid}.json").read_text(encoding="utf-8"))
        ref = " ".join(w["t"] for s in tl["segments"] for w in s["words"])
        video = ROOT / "out" / "video" / f"masahif-al-maghrib-{lang}-{cut}.mp4"
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(video), "-ac", "1", "-ar", "16000",
                              "-f", "f32le", "-"], capture_output=True, check=True).stdout
        segs, _ = model.transcribe(np.frombuffer(raw, dtype=np.float32), language=lang, beam_size=5,
                                   condition_on_previous_text=False, vad_filter=True)
        hyp = " ".join(s.text.strip() for s in segs)
        a, b = norm(ref), norm(hyp)
        sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
        print(f"== {cid}: {sm.ratio():.3f} word match ({len(a)} words in script)")
        for op, i1, i2, j1, j2 in sm.get_opcodes():
            if op != "equal":
                print(f"   {op}: script «{' '.join(a[i1:i2])}» / heard «{' '.join(b[j1:j2])}»")


if __name__ == "__main__":
    main(sys.argv[1:] or ["ar", "en", "ar-teaser", "en-teaser"])
