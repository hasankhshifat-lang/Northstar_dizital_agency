#!/bin/sh
# One command: (carlos-1997-short Short, Comic History Cartoon, 1080x1920)
#   sh build.sh            events, picture, mix, master (-14 LUFS), subtitles, readcheck, poster
#   PARTS=1 sh build.sh    re-key the puppet sheets in src/ into parts/ (and recompute the rig)
# The narration (vo/narration.wav) is made with VibeVoice: .claude/skills/vibevoice-voiceover/scripts/voiceover.sh vo/script.txt vo/narration.wav Frank
set -e
LIB=${LIB:-/root/lemo-opuscar}
export LIB
HERE=$(cd "$(dirname "$0")" && pwd)
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the lemo-opuscar library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
NAME=carlos-1997-short
SIZE=1080x1920
WORKERS=${WORKERS:-4}
mkdir -p "$HERE/out"
if [ "${PARTS:-0}" = "1" ]; then "$PY" "$HERE/tools/extract.py"; "$PY" "$HERE/tools/rig.py"; fi
"$PY" "$LIB/core/audio/sampler.py" --need "$HERE/mix.py"
cd "$LIB"
node core/render/events.mjs "$HERE" --size $SIZE --out "$HERE/out/events.json"
node core/render/video.mjs "$HERE" --size $SIZE --fps 24 --workers "$WORKERS" --out "$HERE/out/video.mp4"
"$PY" "$HERE/mix.py" --events out/events.json --out out/mix.wav
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4" 24 1
"$PY" "$HERE/tools/srt.py"
node core/render/readcheck.mjs "$HERE" --size $SIZE > "$HERE/out/readcheck.txt" && echo "readcheck ok" || { tail -12 "$HERE/out/readcheck.txt"; echo "readcheck: see out/readcheck.txt"; }
ffmpeg -v error -y -ss 30.0 -i "$HERE/$NAME.mp4" -frames:v 1 -q:v 3 "$HERE/poster.jpg"
echo "done: $HERE/$NAME.mp4"
