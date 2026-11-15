#!/bin/sh
# One command for all three Shorts:  sh videos/spotlight-effect/build.sh   [marker|whiteboard|stick ...]
# Needs the Lemo-Opuscar library (sh .claude/skills/lemo-opuscar/scripts/setup.sh deps) and audio/narration_final.wav
# (made with VibeVoice: .claude/skills/vibevoice-voiceover/scripts/voiceover.sh audio/narration.txt audio/narration.wav Frank,
#  then pauses tightened to ~0.32 s and atempo 1.06; see README.md).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$HOME/lemo-opuscar}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the library folder"; exit 1; }
cd "$LIB"
for n in ${*:-marker whiteboard stick}; do
  F="$HERE/$n"; mkdir -p "$F/out"
  node core/render/events.mjs "$F" --size 1080x1920 --out "$F/out/events.json"
  node core/render/video.mjs "$F" --fps 24 --workers 4 --size 1080x1920 --out "$F/out/video.mp4"
  "$LIB/.venv/bin/python" "$HERE/mix.py" "$F"
  sh core/render/mux.sh "$F/out/video.mp4" "$F/out/mix.wav" "$F/spotlight-$n.mp4" 24 0
  node core/render/still.mjs "$F" 10.8 --size 1080x1920 --q nosubs=1 --out "$F/out/poster" > /dev/null
  cp "$F/out/poster/t_10.8.jpg" "$F/poster.jpg"
done
