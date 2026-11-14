#!/usr/bin/env bash
# Derived images for the scene: blurred backdrops and a gold cut of a script
# plate. Needs ImageMagick. Writes scene/img/.
set -euo pipefail
cd "$(dirname "$0")/.."
SITE=..
OUT=scene/img
mkdir -p "$OUT"

blur() {  # source, name: a soft, dark backdrop at a quarter of the frame size
  convert "$1" -resize 540x960^ -gravity center -extent 540x960 \
    -blur 0x18 -modulate 70,115 -quality 86 "$OUT/$2"
}
blur "$SITE/marini/plates/aq-saffat.jpg"           bg-aqsa.jpg
blur assets/mansur-colophon-tall.jpg               bg-mansur.jpg
blur "$SITE/marini/plates/mc-fatiha.jpg"           bg-munich.jpg
blur "$SITE/wattasi/plates/gr-text.jpg"            bg-green.jpg
blur assets/mansur-colophon-wide.jpg               bg-gold.jpg
blur "$SITE/muwahhidun/plates/mt-juz1.jpg"         bg-caliph.jpg
blur "$SITE/muwahhidun/plates/pk-met4.jpg"         bg-author.jpg

# al-Qandusi's bold Maghribi script (Fez, 1266 AH) as gold strokes on transparency
convert "$SITE/alawi/plates/qd-jumua.jpg" -colorspace gray -negate -level 35%,85% "$OUT/_mask.png"
convert "$OUT/_mask.png" -fill '#d9ae5c' -colorize 100 "$OUT/_gold.png"
convert "$OUT/_gold.png" "$OUT/_mask.png" -alpha off -compose CopyOpacity -composite \
  -resize 900x "$OUT/script-gold.png"
rm "$OUT/_mask.png" "$OUT/_gold.png"
ls -la "$OUT"
