#!/usr/bin/env python3
"""The soundtrack of a cut: the narration on its timeline, a light mastering
chain on the voice, a touch of room, and effects synthesized here at the
scene's own sound cues (whooshes, clicks, a soft impact). No music.

    python tools/mix.py ar          → build/ar/mix.wav  (48 kHz stereo, -14 LUFS)
    python tools/mix.py ar-teaser   → build/ar-teaser/mix.wav

Needs numpy, scipy, soundfile and ffmpeg. Reads scene/timeline.<cut>.json,
build/voice/<lang>/*.mp3 and build/<cut>/sfx.json (from render.js).
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(1347)


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR),
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


def ffmpeg_filter(x, chain, channels=1):
    """Run a float signal through an ffmpeg audio filter chain."""
    data = np.ascontiguousarray(x, dtype=np.float32).tobytes()
    out = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", str(channels), "-i", "-",
                          "-af", chain, "-f", "f32le", "-ar", str(SR), "-ac", str(channels), "-"],
                         input=data, capture_output=True, check=True).stdout
    y = np.frombuffer(out, dtype=np.float32).astype(np.float64)
    return y.reshape(-1, channels) if channels > 1 else y


# ---------------------------------------------------------------- the voice
VOICE_CHAIN = {
    # Hamed goes out as the voice delivered it: EQ, de-essing and compression
    # dulled his س into ص and swallowed the ends of words
    "ar": "highpass=f=60:p=2",
    # Andrew falls off early, so he gets presence and a gentle shelf of air
    "en": ",".join([
        "highpass=f=72:p=2",
        "equalizer=f=150:t=q:w=0.9:g=1.2",
        "equalizer=f=360:t=q:w=1.3:g=-2.2",
        "equalizer=f=3300:t=q:w=1.1:g=2",
        "treble=g=2.5:f=8500:t=s",
        "deesser=i=0.3:m=0.5:f=0.5",
        "acompressor=threshold=-22dB:ratio=3:attack=6:release=150:makeup=2.5:knee=4",
    ]),
}


ROOM_DB = {"ar": -60, "en": -17}   # no room on the Arabic voice: it blurred the consonants


def room_ir(seconds=1.1, rt60=0.55, predelay=0.014):
    """A small, warm room: decaying noise, darker as it decays, per ear."""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    irs = []
    for _ in range(2):
        tail = rng.standard_normal(n) * np.exp(-6.91 * t / rt60)
        bright = signal.sosfilt(signal.butter(2, 5200, "low", fs=SR, output="sos"), tail)
        dark = signal.sosfilt(signal.butter(2, 1600, "low", fs=SR, output="sos"), tail)
        k = np.clip(t / (rt60 * 0.8), 0, 1)
        ir = (1 - k) * bright + k * dark
        ir = np.concatenate([np.zeros(int(predelay * SR)), ir])
        irs.append(ir / np.sqrt(np.sum(ir ** 2)))
    return irs


# ---------------------------------------------------------------- effects
def svf(x, fc, q=0.7, mode="band"):
    """State-variable filter with a cutoff that may move (array or number)."""
    fc = np.broadcast_to(np.asarray(fc, dtype=np.float64), x.shape)
    f = 2 * np.sin(np.pi * np.minimum(fc, SR / 6) / SR)
    damp = 1 / q
    low = band = 0.0
    out = np.empty_like(x)
    for i in range(len(x)):
        high = x[i] - low - damp * band
        band += f[i] * high
        low += f[i] * band
        out[i] = band if mode == "band" else low if mode == "low" else high
    return out


def pan(x, p):
    """Equal-power pan, p in [-1, 1] (number or array) → (n, 2)."""
    p = np.broadcast_to(np.asarray(p, dtype=np.float64), x.shape)
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def norm(x, peak_db):
    return x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)


def whoosh(dur=0.85, lo=260, hi=4200, p0=-0.5, p1=0.5, peak=0.55):
    n = int(dur * SR)
    s = np.linspace(0, 1, n)
    shape = np.where(s < peak, s / peak, 1 - (s - peak) / (1 - peak))
    fc = lo * (hi / lo) ** np.clip(shape, 0, 1)
    x = svf(rng.standard_normal(n), fc, q=0.9)
    x = x + 0.35 * svf(rng.standard_normal(n), fc * 0.5, q=0.6, mode="low")
    env = np.sin(np.pi * np.clip(shape, 0, 1) / 2) ** 2.2
    return pan(norm(x * env, 0), np.linspace(p0, p1, n))


def impact(dur=1.8):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 64 * (36 / 64) ** np.clip(t / 0.9, 0, 1)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5)
    body = signal.sosfilt(signal.butter(2, 190, "low", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t / 0.13) * 2.5
    hit = signal.sosfilt(signal.butter(2, [900, 4200], "band", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t / 0.012) * 0.6
    x = norm(sub + body + hit, 0)
    return pan(x, 0)


def grains(dur, rate, band, length=0.006, spread=0.9, decay=None):
    n = int(dur * SR)
    out = np.zeros((n, 2))
    count = int(dur * rate)
    for _ in range(count):
        at = rng.uniform(0, dur * 0.92)
        g = int(length * SR)
        w = np.hanning(g) * rng.standard_normal(g)
        w = signal.sosfilt(signal.butter(2, band, "band", fs=SR, output="sos"), w)
        amp = rng.uniform(0.3, 1.0) * (np.exp(-at / decay) if decay else 1)
        i = int(at * SR)
        out[i:i + g] += pan(w * amp, rng.uniform(-spread, spread))[: n - i]
    return out


def shimmer(dur=1.5):
    x = grains(dur, 70, [5200, 13500], length=0.008, decay=0.7)
    n = len(x)
    t = np.arange(n) / SR
    air = signal.sosfilt(signal.butter(2, [6000, 12000], "band", fs=SR, output="sos"), rng.standard_normal(n))
    air *= np.minimum(t / 0.12, 1) * np.exp(-t / 0.55) * 0.25
    x = x + pan(air, 0)
    return x / (np.max(np.abs(x)) + 1e-9)


def click(band=(1800, 4600), decay=0.03, length=0.12):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = signal.sosfilt(signal.butter(2, band, "band", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t / decay)
    return x / (np.max(np.abs(x)) + 1e-9)


def ping():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    burst = rng.standard_normal(n) * np.exp(-t / 0.002)
    x = svf(burst, 2700, q=28) + 0.5 * svf(burst, 4100, q=22)
    x *= np.exp(-t / 0.12)
    return pan(norm(x, 0), rng.uniform(-0.3, 0.3))


def tick():
    return pan(click(), rng.uniform(-0.15, 0.15))


def sparkle():
    x = grains(0.7, 22, [3000, 9000], length=0.01, spread=0.8, decay=0.35)
    return x / (np.max(np.abs(x)) + 1e-9)


def tap():
    n = int(0.2 * SR)
    t = np.arange(n) / SR
    c = np.pad(click((700, 2600), 0.022, 0.12), (0, n - int(0.12 * SR)))
    thump = np.sin(2 * np.pi * 130 * t) * np.exp(-t / 0.05) * 0.6
    return pan(norm(c + thump, 0), 0)


def key():
    n = int(0.12 * SR)
    a = click((1500, 6000), 0.012 * rng.uniform(0.8, 1.2), 0.06)
    b = click((2200, 7000), 0.008, 0.04) * 0.35
    x = np.zeros(n)
    x[: len(a)] += a
    j = int(rng.uniform(0.045, 0.06) * SR)
    x[j:j + len(b)] += b[: n - j]
    return pan(x * rng.uniform(0.75, 1.0), rng.uniform(-0.1, 0.1))


def scatter():
    out = np.zeros((int(2.2 * SR), 2))
    for i in range(9):
        w = whoosh(rng.uniform(0.35, 0.55), 900, rng.uniform(5000, 8000), 0, rng.uniform(-0.9, 0.9), peak=0.3)
        at = int((0.08 + i * 0.12 + rng.uniform(0, 0.05)) * SR)
        out[at:at + len(w)] += w[: len(out) - at] * (1 - i * 0.06)
    return out / (np.max(np.abs(out)) + 1e-9)


def reverse():
    w = whoosh(0.9, 300, 3800, 0.6, -0.1, peak=0.85)
    return w


def swell():
    w = whoosh(1.5, 140, 1800, -0.2, 0.2, peak=0.8)
    return w


SFX = {  # synth, peak level in dBFS before the event's own gain
    "whoosh": (lambda: whoosh(rng.uniform(0.75, 0.95), p0=rng.uniform(-0.7, -0.3), p1=rng.uniform(0.3, 0.7)), -19),
    "impact": (impact, -11), "shimmer": (shimmer, -25), "ping": (ping, -25), "tick": (tick, -26),
    "sparkle": (sparkle, -26), "tap": (tap, -21), "key": (key, -27), "scatter": (scatter, -21),
    "reverse": (reverse, -20), "swell": (swell, -22),
}


def _hold(env, n):
    """Running maximum over the last n samples (a ducking hold)."""
    from scipy.ndimage import maximum_filter1d
    return maximum_filter1d(env, size=n, origin=(n - 1) // 2)


def main(cut):
    lang = cut.split("-")[0]
    tl = json.loads((ROOT / "scene" / f"timeline.{cut}.json").read_text(encoding="utf-8"))
    cues = json.loads((ROOT / "build" / cut / "sfx.json").read_text(encoding="utf-8"))
    total = int((tl["duration"] + 0.5) * SR)

    # narration, placed where the timeline says
    dry = np.zeros(total)
    for seg in tl["segments"]:
        x = decode(ROOT / "build" / "voice" / lang / seg["audio"])
        i = int(round(seg["start"] * SR))
        dry[i:i + len(x)] += x[: total - i]
    voice = ffmpeg_filter(dry, VOICE_CHAIN[lang])[:total]
    voice = np.pad(voice, (0, total - len(voice)))
    irl, irr = room_ir()
    wet = np.stack([signal.fftconvolve(voice, irl)[:total], signal.fftconvolve(voice, irr)[:total]], axis=1)
    mix = np.stack([voice, voice], axis=1) + wet * 10 ** (ROOM_DB[lang] / 20)

    # effects, a little lower while someone is speaking
    sfx = np.zeros((total, 2))
    for c in cues["sfx"]:
        make, peak = SFX[c["type"]]
        x = make() * 10 ** (peak / 20) * c.get("gain", 1)
        i = int(round(c["t"] * SR))
        if i >= total:
            continue
        sfx[i:i + len(x)] += x[: total - i]
    env = np.sqrt(signal.sosfilt(signal.butter(1, 12, "low", fs=SR, output="sos"), voice ** 2).clip(0))
    # hold the ducking a quarter second past each word, so endings are not covered
    env = _hold(env, int(0.25 * SR))
    duck = 10 ** (-12 * np.clip(env / (np.percentile(env, 95) + 1e-9), 0, 1) / 20)
    mix += sfx * duck[:, None]

    # room tone, so silence never drops to digital zero
    tone = signal.sosfilt(signal.butter(2, 2400, "low", fs=SR, output="sos"), rng.standard_normal((total, 2)), axis=0)
    mix += tone / np.sqrt(np.mean(tone ** 2)) * 10 ** (-56 / 20)

    # fade at the very end with the picture
    fade = int(0.7 * SR)
    end = int(tl["duration"] * SR)
    mix[end - fade:end] *= np.linspace(1, 0, fade)[:, None] ** 2
    mix[end:] = 0
    mix = mix[:end]

    out = ROOT / "build" / cut
    raw = out / "mix_raw.wav"
    sf.write(raw, mix.astype(np.float32), SR, subtype="FLOAT")
    # two-pass loudness normalisation for social platforms: -14 LUFS, -1 dBTP
    m = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af",
                        "loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    meas = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
    chain = ("loudnorm=I=-14:TP=-1.0:LRA=11:linear=true:"
             f"measured_I={meas['input_i']}:measured_TP={meas['input_tp']}:measured_LRA={meas['input_lra']}:"
             f"measured_thresh={meas['input_thresh']}:offset={meas['target_offset']}")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af", chain, "-ar", str(SR),
                    "-c:a", "pcm_s24le", str(out / "mix.wav")], check=True)
    print(f"{out / 'mix.wav'}: {len(mix) / SR:.2f}s, measured {meas['input_i']} LUFS → -14")


if __name__ == "__main__":
    main(sys.argv[1])
