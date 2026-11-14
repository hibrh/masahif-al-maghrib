#!/usr/bin/env bash
# The final files of a cut: picture from render.js, sound from mix.py.
#   tools/encode.sh ar          →  out/video/masahif-al-maghrib-ar-full.mp4           (1080×1920, for upload)
#                                  out/video/masahif-al-maghrib-ar-full-whatsapp.mp4  (720×1280, light)
#   tools/encode.sh ar-teaser   →  out/video/masahif-al-maghrib-ar-teaser.mp4 and its light copy
# Covers, posts and subtitles come from tools/posts.js and tools/subtitles.py.
set -euo pipefail
cd "$(dirname "$0")/.."
id=$1
lang=${id%%-*}
cut=full
[ "$id" != "$lang" ] && cut=${id#*-}
pic=build/$id/video.mp4
snd=build/$id/mix.wav
base=out/video/masahif-al-maghrib-$lang-$cut
mkdir -p out/video
if [ "$lang" = ar ]; then
  title="مصاحف المغرب · masahif-al-maghrib.com"
  credit="تطوير الموقع وإنتاج الفيديو: خالد بن جلون، مطوّر من فاس"
  alang=ara
else
  title="Masahif al-Maghrib · masahif-al-maghrib.com"
  credit="Website development and video production: Khalid Benjelloun, developer from Fez"
  alang=eng
fi
meta=(-metadata "title=$title" -metadata "comment=$credit" -metadata "artist=Khalid Benjelloun"
      -metadata:s:a:0 "language=$alang")

# for Reels, Shorts, TikTok, Facebook, X: full size, generous bitrate
ffmpeg -y -v error -i "$pic" -i "$snd" -map 0:v -map 1:a \
  -c:v libx264 -preset slow -crf 19 -maxrate 9M -bufsize 18M -pix_fmt yuv420p -profile:v high -level 4.2 \
  -g 60 -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "${meta[@]}" "$base.mp4"

# for WhatsApp and Telegram: 720p, small enough to send as a video
ffmpeg -y -v error -i "$pic" -i "$snd" -map 0:v -map 1:a \
  -vf "scale=720:1280:flags=lanczos" -c:v libx264 -preset slow -b:v 1700k -maxrate 2400k -bufsize 4800k \
  -pix_fmt yuv420p -profile:v high -level 4.0 -g 60 -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 128k -ar 48000 -movflags +faststart "${meta[@]}" "$base-whatsapp.mp4"

ls -la "$base.mp4" "$base-whatsapp.mp4"
