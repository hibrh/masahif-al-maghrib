#!/usr/bin/env python3
"""The index of out/: every file to post, its size and length, and where it goes.

    python tools/index.py      → out/README.md

Run it last, after encode.sh, posts.js and subtitles.py. Needs ffprobe.
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
LANG = {"ar": "العربية · Arabic", "en": "الإنجليزية · English"}


def probe(path):
    d = json.loads(subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)],
                                  capture_output=True, text=True, check=True).stdout)
    v = next(s for s in d["streams"] if s["codec_type"] == "video")
    return float(d["format"]["duration"]), v["width"], v["height"]


def size(path):
    n = path.stat().st_size
    return f"{n / 1e6:.1f} MB" if n >= 1e6 else f"{n / 1e3:.0f} KB"


def link(path):
    rel = path.relative_to(OUT).as_posix()
    return f"[`{rel}`]({rel})"


def main():
    rows = []
    rows += ["# مواد النشر · Social media kit", "",
             "كل ملف هنا جاهز للنشر، ونصوص المنشورات (الوصف والوسوم والنص البديل) في [`copy/`](copy/).",
             "صُنعت كلها من مصادر `promo-video/`، وطريقة إعادة إنتاجها في [`../README.md`](../README.md).", "",
             "Every file here is ready to post. The captions, hashtags and alt text are in [`copy/`](copy/).",
             "All of it is built from the sources in `promo-video/`; [`../README.md`](../README.md) explains how.", ""]

    rows += ["## أين يُنشر كل ملف · Where each file goes", "",
             "| المنصة · Platform | الملف · File | النص · Text |", "|---|---|---|",
             "| Instagram Reels, Facebook Reels | `video/…-full.mp4` or `…-teaser.mp4`, with its cover from `covers/` | `copy/captions-*.md`, §1 or §2 |",
             "| TikTok | `video/…-teaser.mp4` (or `…-full.mp4`) | §2 |",
             "| YouTube Shorts | `video/…-full.mp4`, with its `.srt` from `subtitles/` | §1, the YouTube title |",
             "| Instagram and Facebook feed | the seven images in `carousel/<lang>/`, in order | §3, with the alt text of each image |",
             "| LinkedIn | `video/…-full.mp4`, or `carousel/…-carousel.pdf` as a document | §6 (English) or §1 |",
             "| X | `video/…-teaser.mp4` | §5 |",
             "| Stories (Instagram, Facebook, WhatsApp) | `stories/…-story.jpg` with a link sticker, or `video/…-teaser.mp4` | §4 |",
             "| WhatsApp, Telegram | `video/…-whatsapp.mp4` (720p, light) | the WhatsApp text |", ""]

    rows += ["## الفيديو · Video", "",
             "| الملف · File | اللغة · Language | المدة · Length | الأبعاد · Size | الحجم · File size |", "|---|---|---|---|---|"]
    for f in sorted((OUT / "video").glob("*.mp4")):
        dur, w, h = probe(f)
        lang = f.name.split("-")[3]
        rows.append(f"| {link(f)} | {LANG[lang]} | {dur:.0f} s | {w}×{h} | {size(f)} |")
    rows += ["", "`full`: the whole cut. `teaser`: the opening, the guide's name, the treasures and the address. "
             "`whatsapp`: a 720p copy small enough to send in messaging apps.", ""]

    for title, sub, glob in [("## الأغلفة · Video covers", "1080×1920, the title inside the 3:4 crop that profile grids show.", "covers/*.jpg"),
                             ("## القصص · Stories", "1080×1920, with room for a link sticker over the address.", "stories/*.jpg")]:
        rows += [title, "", sub, "", "| الملف · File | الحجم · File size |", "|---|---|"]
        rows += [f"| {link(f)} | {size(f)} |" for f in sorted(OUT.glob(glob))]
        rows.append("")

    rows += ["## الكاروسيل · Carousel", "",
             "Seven images, 1080×1350 (4:5): a cover, five Qur'ans in order of date with the source of each image, and the guide. "
             "The PDF holds the same seven pages, for LinkedIn.", "",
             "| اللغة · Language | الصور · Images | PDF |", "|---|---|---|"]
    for lang in ("ar", "en"):
        imgs = sorted((OUT / "carousel" / lang).glob("*.jpg"))
        pdf = OUT / "carousel" / f"masahif-al-maghrib-{lang}-carousel.pdf"
        rows.append(f"| {LANG[lang]} | [`carousel/{lang}/`](carousel/{lang}/) ({len(imgs)}) | {link(pdf) if pdf.exists() else ''} |")
    rows.append("")

    rows += ["## الترجمة · Subtitles", "",
             "SRT and WebVTT for each cut, for YouTube, Facebook and LinkedIn. The videos already show the words on screen.", "",
             "| الملف · File | الملف · File |", "|---|---|"]
    for f in sorted((OUT / "subtitles").glob("*.srt")):
        rows.append(f"| {link(f)} | {link(f.with_suffix('.vtt'))} |")
    rows.append("")

    rows += ["## النصوص · Copy", "", "| الملف · File | |", "|---|---|",
             "| [`copy/captions-ar.md`](copy/captions-ar.md) | نصوص النشر بالعربية لكل منصة، مع الوسوم والنص البديل |",
             "| [`copy/captions-en.md`](copy/captions-en.md) | English captions for each platform, with hashtags and alt text |", ""]
    (OUT / "README.md").write_text("\n".join(rows), encoding="utf-8")
    print("out/README.md written")


if __name__ == "__main__":
    main()
