#!/bin/sh
# As Printed episode build. usage: sh build.sh <episode_dir> <step>
#   voice   copy the page in, prep textures, VibeVoice narration (long + short), speech check, timing      (~60 min)
#   render  long (1920x1080) and short (1080x1920) pictures                                                (~45 min)
#   finish  mix, master, subtitles, reading check, thumbnails, sheet                                       (~10 min)
#   all     the three in order (only when nothing limits a command's run time)
set -e
ENG=$(cd "$(dirname "$0")" && pwd); EP=$(cd "$1" && pwd); STEP=${2:-all}
LIB=${LIB:-/root/lemo-opuscar}; PY=$LIB/.venv/bin/python; VV=/root/vv/bin/python
SLUG=$(python3 -c "import json;print(json.load(open('$EP/episode.json'))['slug'])")
voice() {
  cp "$ENG/index.html" "$ENG/film.js" "$ENG/thumb.html" "$EP/"; mkdir -p "$EP/fonts"; cp "$ENG"/fonts/* "$EP/fonts/"
  "$PY" -I "$ENG/tools/prep.py" "$EP"
  sh "$ENG/voice/setup_vibevoice.sh"
  for F in long short; do
    node "$ENG/tools/export.mjs" "$EP" lines $F
    "$VV" "$ENG/voice/vv_tts.py" "$EP/voice/$F/lines.json" "$EP/voice/$F/out" 2>&1 | grep -vE "it/s|Warning|warn|Fetching|Loading" || true
    (cd "$LIB" && WHISPER_MODEL=small.en "$PY" core/tts/asr_check.py "$EP/voice/$F/lines.json" "$EP/voice/$F/out" --lang en > "$EP/voice/$F/asr.txt" 2>&1) || true
    grep -E "^DIFF" "$EP/voice/$F/asr.txt" || true
    node "$ENG/tools/export.mjs" "$EP" timeline $F
  done
}
render() {
  cd "$LIB"
  node core/render/video.mjs "$EP" --fps 24 --workers 3 --size 1920x1080 --q "film=long" --out "$EP/out/long/video.mp4"
  node core/render/video.mjs "$EP" --fps 30 --workers 3 --size 1080x1920 --q "film=short" --out "$EP/out/short/video.mp4"
}
finish() {
  for F in long short; do
    FPS=24; [ $F = short ] && FPS=30
    # a re-run keeps finished parts: delete out/$F/muxed.mp4 (and master.mp4) to remix
    [ -f "$EP/out/$F/muxed.mp4" ] || { "$PY" "$ENG/mix.py" "$EP" $F
    (cd "$LIB" && sh core/render/mux.sh "$EP/out/$F/video.mp4" "$EP/out/$F/mix.wav" "$EP/out/$F/muxed.mp4" $FPS 1) | grep -E " I:" | tail -n 1; }
    # master (YouTube upload, git-ignored) at crf 21; the repo copy must stay under GitHub's 100 MB limit
    [ -f "$EP/out/$F/master.mp4" ] || ffmpeg -v error -y -i "$EP/out/$F/muxed.mp4" -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a copy "$EP/out/$F/master.mp4"
    MB=$(( $(stat -c %s "$EP/out/$F/master.mp4") / 1048576 ))
    if [ $MB -lt 95 ]; then cp "$EP/out/$F/master.mp4" "$EP/${SLUG}_$F.mp4"; else
      D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$EP/out/$F/master.mp4")
      VK=$(python3 -c "print(int(92*8388.608/$D - 128))")   # ~92 MiB in all, 128 kb/s audio
      (cd "$EP/out/$F" && ffmpeg -v error -y -i master.mp4 -c:v libx264 -b:v ${VK}k -preset medium -pass 1 -an -f null /dev/null && \
        ffmpeg -v error -y -i master.mp4 -c:v libx264 -b:v ${VK}k -preset medium -pass 2 -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a aac -b:a 128k "$EP/${SLUG}_$F.mp4"; rm -f ffmpeg2pass-0.log*)
    fi
    "$PY" "$LIB/core/render/srt.py" "$EP/out/$F/cues_srt.json" "$EP/${SLUG}_$F.srt"
    SZ=$( [ $F = short ] && echo 1080x1920 || echo 1920x1080 )
    (cd "$LIB" && node core/render/readcheck.mjs "$EP" --size $SZ --q "film=$F" --step 0.2 > "$EP/out/$F/readcheck.txt" 2>&1) && echo "$F readcheck ok" || { echo "$F readcheck:"; grep -E "^BAD" "$EP/out/$F/readcheck.txt" | head -20; }
    ffmpeg -i "$EP/${SLUG}_$F.mp4" -vf blackdetect=d=0.5 -f null - 2>&1 | grep -c black_start | sed "s/^/$F black segments: /"
    ls -la "$EP/out/$F/master.mp4" "$EP/${SLUG}_$F.mp4"
  done
  [ -f "$EP/thumb.json" ] && node "$ENG/tools/thumb.mjs" "$EP" || echo "no thumb.json yet"
  ffmpeg -v error -y -i "$EP/${SLUG}_long.mp4" -vf "fps=1/20,scale=320:-1,tile=6x6" -frames:v 1 "$EP/out/sheet_long.jpg" || true
  ffmpeg -v error -y -i "$EP/${SLUG}_short.mp4" -vf "fps=1/3,scale=180:-1,tile=10x2" -frames:v 1 "$EP/out/sheet_short.jpg" || true
}
case $STEP in voice) voice ;; render) render ;; finish) finish ;; all) voice; render; finish ;; *) echo "unknown step $STEP"; exit 1 ;; esac
