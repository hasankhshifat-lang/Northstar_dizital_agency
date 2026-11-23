#!/bin/sh
# One command: (panenka-1976-short Short, "Night Match Toon" - Foot All FC's own 2.5D vector style, 1080x1920)
#   sh build.sh      events, picture, mix, master (-14 LUFS), subtitles, readcheck, poster
# Uses only the lemo-opuscar renderer (core/render) and audio helpers (core/audio/sfx.py); the look, characters and score are this project's own.
# Narration (vo/narration.wav) is made with VibeVoice: .claude/skills/vibevoice-voiceover/scripts/voiceover.sh vo/script.txt vo/raw.wav Frank
set -e
LIB=${LIB:-/root/lemo-opuscar}
export LIB
HERE=$(cd "$(dirname "$0")" && pwd)
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the lemo-opuscar library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
NAME=panenka-1976-short
SIZE=1080x1920
WORKERS=${WORKERS:-4}
mkdir -p "$HERE/out"
cd "$LIB"
node core/render/events.mjs "$HERE" --size $SIZE --out "$HERE/out/events.json"
node core/render/video.mjs "$HERE" --size $SIZE --fps 24 --workers "$WORKERS" --out "$HERE/out/video.mp4"
"$PY" "$HERE/mix.py" --events out/events.json --out out/mix.wav
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4" 24 1
"$PY" "$HERE/tools/srt.py"
node core/render/readcheck.mjs "$HERE" --size $SIZE > "$HERE/out/readcheck.txt" && echo "readcheck ok" || { tail -12 "$HERE/out/readcheck.txt"; echo "readcheck: see out/readcheck.txt"; }
ffmpeg -v error -y -ss 36.6 -i "$HERE/$NAME.mp4" -frames:v 1 -q:v 3 "$HERE/poster.jpg"
echo "done: $HERE/$NAME.mp4"
