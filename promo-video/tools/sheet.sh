#!/usr/bin/env bash
# Contact sheet of a cut: one still at the middle of every caption (plus the first
# frame and the end card), with the social apps' overlay zones drawn on top.
#   tools/sheet.sh ar                 → build/review/ar.png
#   tools/sheet.sh ar-teaser out.png
set -euo pipefail
cd "$(dirname "$0")/.."
id=$1
out=${2:-build/review/$id.png}
mkdir -p "$(dirname "$out")"
times=$(python3 - "scene/timeline.$id.json" <<'EOF'
import json, sys
tl = json.load(open(sys.argv[1], encoding="utf-8"))
ts = [0.0]
for seg in tl["segments"]:
    for ch in seg["chunks"]:
        w = [seg["words"][i] for i in ch]
        ts.append(round((w[0]["s"] + w[-1]["e"]) / 2, 2))
ts.append(round(tl["scenes"]["end"]["start"] + 2.0, 2))
print(" ".join(str(t) for t in ts))
EOF
)
node tools/stills.js "$id" $times > /dev/null
for t in $times; do
  convert "build/stills/$id-$(printf '%.2f' "$t").png" tools/safezones.png -composite -resize 270x480 \
    -gravity north -fill yellow -undercolor '#000000a0' -pointsize 22 -annotate +0+4 "$t" miff:-
done | montage - -tile 8x -geometry +3+3 -background '#444' "$out"
echo "$out"
