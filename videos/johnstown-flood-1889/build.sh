#!/bin/sh
# One command: Fourteen Miles — the Johnstown Flood, 1889 (3D Map Explainer, 1080×1920, 24 fps)
#   sh build.sh              data and fonts if missing, voice if missing + speech check, cues, events, picture, mix, master, subtitles, checks
#   FETCH=1 sh build.sh      download every tile again and rebuild the map assets
#   VOICE=1 sh build.sh      regenerate the narration
#   WORKERS=3 sh build.sh    render workers
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the Lemo-Opuscar library folder (sh .claude/skills/lemo-opuscar/scripts/setup.sh prints it)"; exit 1; }
PY="$LIB/.venv/bin/python"; NAME=johnstown-flood-1889; WORKERS=${WORKERS:-3}; SIZE=1080x1920
cd "$LIB"
mkdir -p "$HERE/out/voice" "$HERE/raw" "$HERE/assets"
if [ "${FETCH:-0}" = "1" ] || [ ! -f "$HERE/assets/height.bin" ]; then
  "$PY" -I "$HERE/tools/fetch.py" "$HERE" || true      # Overpass may be unreachable: river + places come from Nominatim (below)
  for q in "Little Conemaugh River" "South Fork Little Conemaugh River"; do
    f="$HERE/raw/nom_$(echo $q | tr ' ' _).json"; [ -f "$f" ] || curl -sS -A "northstar-film-tools/1.0" -o "$f" \
      "https://nominatim.openstreetmap.org/search?format=json&limit=5&polygon_geojson=1&viewbox=-78.97,40.40,-78.70,40.28&bounded=1&q=$(echo $q | sed 's/ /%20/g')"
  done
  "$PY" -I "$HERE/tools/prep.py" "$HERE"; "$PY" -I "$HERE/tools/bake.py" "$HERE"
fi
[ -f "$HERE/fonts/BarlowCondensed-SemiBold.ttf" ] || "$PY" -I "$HERE/tools/fonts.py" "$HERE"
if [ "${VOICE:-0}" = "1" ] || [ ! -f "$HERE/out/voice/v11.wav" ]; then "$PY" core/tts/tts.py "$HERE/voice/lines.json" "$HERE/out/voice"; fi
"$PY" core/tts/asr_check.py "$HERE/voice/lines.json" "$HERE/out/voice" --lang en
python3 "$HERE/tools/cues.py"
node core/render/events.mjs "$HERE"
"$PY" core/audio/sampler.py --need "$HERE/mix.py" || true
node core/render/video.mjs "$HERE" --fps 24 --workers "$WORKERS" --size $SIZE --out "$HERE/out/video.mp4"
"$PY" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4" 24 1
"$PY" core/render/srt.py "$HERE/voice/cues.json" "$HERE/$NAME.srt"
node core/render/readcheck.mjs "$HERE" --size $SIZE > "$HERE/out/readcheck.txt" && echo "readcheck ok" || { tail -20 "$HERE/out/readcheck.txt"; exit 1; }
node core/render/still.mjs "$HERE" 46 --size $SIZE --q nosubs=1 --out "$HERE/out/poster" > /dev/null
ffmpeg -v error -y -i "$HERE/out/poster/t_46.jpg" -q:v 3 "$HERE/poster.jpg"
echo "done: $HERE/$NAME.mp4"
