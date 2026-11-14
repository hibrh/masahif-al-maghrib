#!/usr/bin/env python3
"""Subtitle files for each cut, from the same timeline as the burned-in captions.

    python tools/subtitles.py            # every cut that has a timeline
    python tools/subtitles.py ar-teaser  # one cut

Writes out/subtitles/masahif-al-maghrib-<lang>-<cut>.srt and .vtt: one cue per
caption phrase, from just before its first word to just before the next phrase.
For YouTube, Facebook and LinkedIn, which read captions from a file; the videos
already carry the words on screen for those who watch without sound.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAX_LINE = {"ar": 38, "en": 42}   # characters per line before a cue takes two lines


def lines(text, lang):
    """One line, or two of about the same length, split at a space."""
    if len(text) <= MAX_LINE[lang]:
        return [text]
    words = text.split()
    best = min(range(1, len(words)), key=lambda k: abs(len(" ".join(words[:k])) - len(" ".join(words[k:]))))
    return [" ".join(words[:best]), " ".join(words[best:])]


def cues(tl):
    out = []
    segs = tl["segments"]
    for si, seg in enumerate(segs):
        for ci, ch in enumerate(seg["chunks"]):
            words = [seg["words"][i] for i in ch]
            start = max(0.0, words[0]["s"] - 0.1)
            if ci + 1 < len(seg["chunks"]):
                end = seg["words"][seg["chunks"][ci + 1][0]]["s"] - 0.1
            else:
                end = words[-1]["e"] + 0.6
                if si + 1 < len(segs):
                    end = min(end, segs[si + 1]["words"][0]["s"] - 0.15)
            out.append((start, max(end, start + 0.6), " ".join(w["t"] for w in words)))
    return out


def stamp(t, sep):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}"


def main(ids):
    out = ROOT / "out" / "subtitles"
    out.mkdir(parents=True, exist_ok=True)
    for cut_id in ids:
        tl = json.loads((ROOT / "scene" / f"timeline.{cut_id}.json").read_text(encoding="utf-8"))
        lang, cut = tl["lang"], tl.get("cut", "full")
        cs = cues(tl)
        srt, vtt = [], ["WEBVTT", f"Language: {lang}", ""]
        for n, (a, b, text) in enumerate(cs, 1):
            body = "\n".join(lines(text, lang))
            srt += [str(n), f"{stamp(a, ',')} --> {stamp(b, ',')}", body, ""]
            vtt += [f"{stamp(a, '.')} --> {stamp(b, '.')}", body, ""]
        base = out / f"masahif-al-maghrib-{lang}-{cut}"
        base.with_suffix(".srt").write_text("\n".join(srt), encoding="utf-8")
        base.with_suffix(".vtt").write_text("\n".join(vtt), encoding="utf-8")
        print(f"{base.name}.srt / .vtt: {len(cs)} cues")


if __name__ == "__main__":
    ids = sys.argv[1:] or sorted(p.stem.split(".", 1)[1] for p in (ROOT / "scene").glob("timeline.*.json"))
    main(ids)
