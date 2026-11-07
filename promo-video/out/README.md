# مواد النشر · Social media kit

كل ملف هنا جاهز للنشر، ونصوص المنشورات (الوصف والوسوم والنص البديل) في [`copy/`](copy/).
صُنعت كلها من مصادر `promo-video/`، وطريقة إعادة إنتاجها في [`../README.md`](../README.md).

Every file here is ready to post. The captions, hashtags and alt text are in [`copy/`](copy/).
All of it is built from the sources in `promo-video/`; [`../README.md`](../README.md) explains how.

## أين يُنشر كل ملف · Where each file goes

| المنصة · Platform | الملف · File | النص · Text |
|---|---|---|
| Instagram Reels, Facebook Reels | `video/…-full.mp4` or `…-teaser.mp4`, with its cover from `covers/` | `copy/captions-*.md`, §1 or §2 |
| TikTok | `video/…-teaser.mp4` (or `…-full.mp4`) | §2 |
| YouTube Shorts | `video/…-full.mp4`, with its `.srt` from `subtitles/` | §1, the YouTube title |
| Instagram and Facebook feed | the seven images in `carousel/<lang>/`, in order | §3, with the alt text of each image |
| LinkedIn | `video/…-full.mp4`, or `carousel/…-carousel.pdf` as a document | §6 (English) or §1 |
| X | `video/…-teaser.mp4` | §5 |
| Stories (Instagram, Facebook, WhatsApp) | `stories/…-story.jpg` with a link sticker, or `video/…-teaser.mp4` | §4 |
| WhatsApp, Telegram | `video/…-whatsapp.mp4` (720p, light) | the WhatsApp text |

## الفيديو · Video

| الملف · File | اللغة · Language | المدة · Length | الأبعاد · Size | الحجم · File size |
|---|---|---|---|---|
| [`video/masahif-al-maghrib-ar-full-whatsapp.mp4`](video/masahif-al-maghrib-ar-full-whatsapp.mp4) | العربية · Arabic | 78 s | 720×1280 | 16.8 MB |
| [`video/masahif-al-maghrib-ar-full.mp4`](video/masahif-al-maghrib-ar-full.mp4) | العربية · Arabic | 78 s | 1080×1920 | 41.6 MB |
| [`video/masahif-al-maghrib-ar-teaser-whatsapp.mp4`](video/masahif-al-maghrib-ar-teaser-whatsapp.mp4) | العربية · Arabic | 34 s | 720×1280 | 6.9 MB |
| [`video/masahif-al-maghrib-ar-teaser.mp4`](video/masahif-al-maghrib-ar-teaser.mp4) | العربية · Arabic | 34 s | 1080×1920 | 22.1 MB |
| [`video/masahif-al-maghrib-en-full-whatsapp.mp4`](video/masahif-al-maghrib-en-full-whatsapp.mp4) | الإنجليزية · English | 74 s | 720×1280 | 15.8 MB |
| [`video/masahif-al-maghrib-en-full.mp4`](video/masahif-al-maghrib-en-full.mp4) | الإنجليزية · English | 74 s | 1080×1920 | 40.9 MB |
| [`video/masahif-al-maghrib-en-teaser-whatsapp.mp4`](video/masahif-al-maghrib-en-teaser-whatsapp.mp4) | الإنجليزية · English | 34 s | 720×1280 | 7.0 MB |
| [`video/masahif-al-maghrib-en-teaser.mp4`](video/masahif-al-maghrib-en-teaser.mp4) | الإنجليزية · English | 34 s | 1080×1920 | 22.2 MB |

`full`: the whole cut. `teaser`: the opening, the guide's name, the treasures and the address. `whatsapp`: a 720p copy small enough to send in messaging apps.

## الأغلفة · Video covers

1080×1920, the title inside the 3:4 crop that profile grids show.

| الملف · File | الحجم · File size |
|---|---|
| [`covers/masahif-al-maghrib-ar-full-cover.jpg`](covers/masahif-al-maghrib-ar-full-cover.jpg) | 315 KB |
| [`covers/masahif-al-maghrib-ar-teaser-cover.jpg`](covers/masahif-al-maghrib-ar-teaser-cover.jpg) | 255 KB |
| [`covers/masahif-al-maghrib-en-full-cover.jpg`](covers/masahif-al-maghrib-en-full-cover.jpg) | 324 KB |
| [`covers/masahif-al-maghrib-en-teaser-cover.jpg`](covers/masahif-al-maghrib-en-teaser-cover.jpg) | 272 KB |

## القصص · Stories

1080×1920, with room for a link sticker over the address.

| الملف · File | الحجم · File size |
|---|---|
| [`stories/masahif-al-maghrib-ar-story.jpg`](stories/masahif-al-maghrib-ar-story.jpg) | 230 KB |
| [`stories/masahif-al-maghrib-en-story.jpg`](stories/masahif-al-maghrib-en-story.jpg) | 256 KB |

## الكاروسيل · Carousel

Seven images, 1080×1350 (4:5): a cover, five Qur'ans in order of date with the source of each image, and the guide. The PDF holds the same seven pages, for LinkedIn.

| اللغة · Language | الصور · Images | PDF |
|---|---|---|
| العربية · Arabic | [`carousel/ar/`](carousel/ar/) (7) | [`carousel/masahif-al-maghrib-ar-carousel.pdf`](carousel/masahif-al-maghrib-ar-carousel.pdf) |
| الإنجليزية · English | [`carousel/en/`](carousel/en/) (7) | [`carousel/masahif-al-maghrib-en-carousel.pdf`](carousel/masahif-al-maghrib-en-carousel.pdf) |

## الترجمة · Subtitles

SRT and WebVTT for each cut, for YouTube, Facebook and LinkedIn. The videos already show the words on screen.

| الملف · File | الملف · File |
|---|---|
| [`subtitles/masahif-al-maghrib-ar-full.srt`](subtitles/masahif-al-maghrib-ar-full.srt) | [`subtitles/masahif-al-maghrib-ar-full.vtt`](subtitles/masahif-al-maghrib-ar-full.vtt) |
| [`subtitles/masahif-al-maghrib-ar-teaser.srt`](subtitles/masahif-al-maghrib-ar-teaser.srt) | [`subtitles/masahif-al-maghrib-ar-teaser.vtt`](subtitles/masahif-al-maghrib-ar-teaser.vtt) |
| [`subtitles/masahif-al-maghrib-en-full.srt`](subtitles/masahif-al-maghrib-en-full.srt) | [`subtitles/masahif-al-maghrib-en-full.vtt`](subtitles/masahif-al-maghrib-en-full.vtt) |
| [`subtitles/masahif-al-maghrib-en-teaser.srt`](subtitles/masahif-al-maghrib-en-teaser.srt) | [`subtitles/masahif-al-maghrib-en-teaser.vtt`](subtitles/masahif-al-maghrib-en-teaser.vtt) |

## النصوص · Copy

| الملف · File | |
|---|---|
| [`copy/captions-ar.md`](copy/captions-ar.md) | نصوص النشر بالعربية لكل منصة، مع الوسوم والنص البديل |
| [`copy/captions-en.md`](copy/captions-en.md) | English captions for each platform, with hashtags and alt text |
