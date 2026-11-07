#!/usr/bin/env bash
# Render, mix and encode cuts, one after another:
#   tools/build_all.sh ar-teaser en-teaser ar en
# Needs `npm install` (Playwright) and a Python with numpy, scipy and soundfile:
# PYTHON, by default ~/.venvs/media/bin/python. The render log is in build/<id>/render.log.
set -euo pipefail
cd "$(dirname "$0")/.."
PY=${PYTHON:-$HOME/.venvs/media/bin/python}
for id in "$@"; do
  t0=$(date +%s)
  mkdir -p "build/$id"
  echo "=== $id render"
  if ! node tools/render.js "$id" 12 > "build/$id/render.log" 2>&1; then
    tail -20 "build/$id/render.log"; exit 1
  fi
  grep -E "frames in" "build/$id/render.log" || true
  echo "=== $id mix";    "$PY" tools/mix.py "$id"
  echo "=== $id encode"; tools/encode.sh "$id"
  echo "=== $id done in $(( $(date +%s) - t0 )) s"
done
