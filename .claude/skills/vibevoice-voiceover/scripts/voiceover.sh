#!/usr/bin/env bash
# English voiceover with VibeVoice-Realtime-0.5B (CPU).
# Usage: voiceover.sh <script.txt> <out.wav|out.mp3> [voice]   (voice default: Frank)
# English voices: Carter Davis Emma Frank Grace Mike (also in-Samuel, Indian English).
# [tags] such as [tense] are removed: VibeVoice has no audio tags; pace with "..." and punctuation.
set -euo pipefail
IN=${1:?script text file}; OUT=${2:?output .wav or .mp3}; VOICE=${3:-Frank}
HERE=$(cd "$(dirname "$0")" && pwd)
[ -x /opt/vibevoice-env/bin/python ] || bash "$HERE/install.sh"
WORK=$(mktemp -d); trap 'rm -rf "$WORK"' EXIT
sed -E 's/\[[^]]*\] ?//g' "$IN" | tr '\n' ' ' | sed -E 's/  +/ /g; s/^ //; s/ $//' > "$WORK/vo.txt"
(cd /opt/VibeVoice && /opt/vibevoice-env/bin/python demo/realtime_model_inference_from_file.py \
   --model_path microsoft/VibeVoice-Realtime-0.5B --txt_path "$WORK/vo.txt" --speaker_name "$VOICE" \
   --device cpu --output_dir "$WORK/out" 2>&1 | grep -aE "^(Audio duration|Generation time|RTF)" || true)
SRC=$(ls "$WORK"/out/*.wav 2>/dev/null | head -1)
[ -n "$SRC" ] || { echo "ERROR: VibeVoice produced no audio" >&2; exit 1; }
mkdir -p "$(dirname "$OUT")"
case "$OUT" in
  *.mp3) ffmpeg -loglevel error -y -i "$SRC" -ar 44100 -b:a 192k "$OUT" ;;
  *)     ffmpeg -loglevel error -y -i "$SRC" -ar 44100 "$OUT" ;;
esac
echo "Saved $OUT ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT") s, voice $VOICE)"
