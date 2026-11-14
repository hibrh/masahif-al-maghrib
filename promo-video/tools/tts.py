#!/usr/bin/env python3
"""Generate the narration, one file per segment, with word timings.

    python tools/tts.py ar        # or: en
    python tools/tts.py ar a4     # regenerate one segment only

Reads voice/script.<lang>.json and writes build/voice/<lang>/<id>.mp3 and
<id>.json (the words, with start and end in seconds). Uses Microsoft's neural
voices through the edge-tts package (pip install edge-tts). Behind a proxy,
HTTPS_PROXY is passed through. A segment's own "rate" overrides the voice's,
to keep the pace even from one sentence to the next.

A segment may list "hold" edits for sounds the voice ignores in the spelling,
such as a shadda or a sukun it rushes: {"word": 2, "at": 0.237, "add": 0.09}
lengthens the sound at <at> seconds after the start of word <word> by <add>
seconds, by repeating whole pitch periods (or the silence of a stop's closure)
from the "loop" seconds (default 0.02) just before that point. "soften" edits
({"word": 2, "from": 0.03, "to": 0.15, "band": [2500, 5500], "gain": -7}) turn a
frequency band down inside one sound, such as the dark edge a س takes on from a
neighbouring ط. The later word timings move with it.
"""
import asyncio
import json
import os
import subprocess
import sys
from pathlib import Path

import edge_tts
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
TICKS = 10_000_000  # edge-tts offsets are in 100 ns units


def decode(mp3_bytes, sr):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "pipe:0", "-ac", "1", "-ar", str(sr),
                          "-f", "f32le", "-"], input=bytes(mp3_bytes), capture_output=True,
                         check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def period(x, c, sr):
    """Pitch period (samples) around sample c, by autocorrelation; 5 ms if unvoiced."""
    w = x[max(0, c - int(0.02 * sr)):c + int(0.02 * sr)]
    w = w - w.mean()
    lo, hi = int(sr / 400), int(sr / 70)
    if len(w) < 2 * hi or not w.any():
        return int(0.005 * sr)
    ac = np.correlate(w, w, "full")[len(w) - 1:]
    lag = lo + int(np.argmax(ac[lo:hi]))
    return lag if ac[lag] > 0.3 * ac[0] else int(0.005 * sr)


def hold(x, c, add, sr, loop=0.02):
    """Insert about <add> s at sample c, looping the whole periods in the <loop> s before it."""
    p = period(x, c, sr)
    chunk = x[c - p * max(1, int(loop * sr) // p):c]
    reps = max(1, round(add * sr / len(chunk)))
    ins = np.tile(chunk, reps)
    # the copy ends where x[c] follows on; soften its first join
    fade = min(int(0.003 * sr), len(chunk) // 4)
    ramp = np.linspace(0, 1, fade, dtype=np.float32)
    ins[:fade] = ins[:fade] * ramp + x[c:c + fade] * (1 - ramp)
    return np.concatenate([x[:c], ins, x[c:]]), len(ins) / sr


def soften(x, a, b, band, gain, sr):
    """Turn <band> down by <gain> dB between samples a and b, with 10 ms ramps."""
    from scipy.signal import butter, sosfiltfilt
    sos = butter(4, band, btype="bandpass", fs=sr, output="sos")
    part = sosfiltfilt(sos, x).astype(np.float32)          # zero phase: lines up with x
    ramp = int(0.01 * sr)
    m = np.zeros(len(x), dtype=np.float32)
    m[a:b] = 1
    m[a - ramp:a] = np.linspace(0, 1, ramp)
    m[b:b + ramp] = np.linspace(1, 0, ramp)
    return x + (10 ** (gain / 20) - 1) * m * part


def apply_edits(audio, words, seg, out):
    sr = 24000
    x = decode(audio, sr)
    for e in seg.get("soften", []):
        w0 = words[e["word"]]["start"]
        x = soften(x, int((w0 + e["from"]) * sr), int((w0 + e["to"]) * sr),
                   e["band"], e["gain"], sr)
    holds = seg.get("hold", [])
    for h in sorted(holds, key=lambda h: -(words[h["word"]]["start"] + h["at"])):
        t = words[h["word"]]["start"] + h["at"]
        x, added = hold(x, int(t * sr), h["add"], sr, h.get("loop", 0.02))
        for w in words:
            if w["start"] >= t:
                w["start"] = round(w["start"] + added, 3)
            if w["end"] >= t:
                w["end"] = round(w["end"] + added, 3)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "1",
                    "-i", "-", "-c:a", "libmp3lame", "-q:a", "0", str(out)],
                   input=x.tobytes(), check=True)


def probe_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True, check=True).stdout
    return float(out.strip())


async def synth(seg, cfg, out_dir):
    comm = edge_tts.Communicate(
        seg["say"], cfg["voice"], rate=seg.get("rate", cfg.get("rate", "+0%")),
        pitch=cfg.get("pitch", "+0Hz"), boundary="WordBoundary",
        proxy=os.environ.get("HTTPS_PROXY"))
    audio, words = bytearray(), []
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio += chunk["data"]
        elif chunk["type"] == "WordBoundary":
            start = chunk["offset"] / TICKS
            words.append({"text": chunk["text"], "start": round(start, 3),
                          "end": round(start + chunk["duration"] / TICKS, 3)})
    mp3 = out_dir / f"{seg['id']}.mp3"
    if seg.get("hold") or seg.get("soften"):
        apply_edits(audio, words, seg, mp3)
    else:
        mp3.write_bytes(audio)
    meta = {"id": seg["id"], "say": seg["say"], "voice": cfg["voice"],
            "rate": seg.get("rate", cfg.get("rate")), "pitch": cfg.get("pitch"),
            "duration": round(probe_duration(mp3), 3), "words": words}
    (out_dir / f"{seg['id']}.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")
    return meta


async def main(lang, only=None):
    cfg = json.loads((ROOT / "voice" / f"script.{lang}.json").read_text(encoding="utf-8"))
    out_dir = ROOT / "build" / "voice" / lang
    out_dir.mkdir(parents=True, exist_ok=True)
    total = 0.0
    for seg in cfg["segments"]:
        if only and seg["id"] not in only:
            continue
        for attempt in range(4):
            try:
                meta = await synth(seg, cfg, out_dir)
                break
            except Exception as err:  # the service drops connections now and then
                print(f"  retry {seg['id']}: {err}")
                await asyncio.sleep(2 ** attempt)
        else:
            raise SystemExit(f"could not synthesize {seg['id']}")
        speech = meta["words"][-1]["end"] if meta["words"] else meta["duration"]
        total += speech + seg.get("gap", 0.4)
        print(f"{seg['id']:>4}  {meta['duration']:6.2f}s file  {speech:6.2f}s speech  {len(meta['words'])} words")
    print(f"total ≈ {total:.1f}s of narration")


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1], set(sys.argv[2:]) or None))
