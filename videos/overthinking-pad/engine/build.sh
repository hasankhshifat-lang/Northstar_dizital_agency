#!/bin/sh
# The Overthinking Pad episode build. usage: sh build.sh <episode_dir> <step> [film]
#   prep    copy the engine (page, runtime, library, fonts, glyphs) into the episode folder
#   voice   VibeVoice narration (voice Frank) for long + short, speech check (words.json), scene timeline   (~40 min)
#   still   review stills: sh build.sh <ep> still long "t1 t2 ..."
#   render  events + picture for long (1920x1080, 24 fps) and short (1080x1920, 24 fps)                    (~60 min)
#   finish  mix, master (-14 LUFS), subtitles, reading check, black-frame check, contact sheets             (~10 min)
#   all     prep voice render finish
# film (optional): long | short (default both)
set -e
ENG=$(cd "$(dirname "$0")" && pwd); EP=$(cd "$1" && pwd); STEP=${2:-all}; FILMS=${3:-"long short"}
LIB=${LIB:-/root/lemo-opuscar}; PY=$LIB/.venv/bin/python; VV=/opt/vibevoice-env/bin/python; export LIB
SLUG=$(basename "$EP" | cut -c12-)
prep() { cp "$ENG/index.html" "$ENG/film.js" "$ENG/lib.js" "$ENG/glyphs.json" "$EP/"; mkdir -p "$EP/fonts"; cp "$ENG"/fonts/*.ttf "$EP/fonts/"; }
voice() {
  [ -x "$VV" ] || bash "$ENG/../../../.claude/skills/vibevoice-voiceover/scripts/install.sh"
  for F in $FILMS; do
    mkdir -p "$EP/voice/$F"
    python3 -c "import json,sys;d=json.load(open('$EP/script.json'));json.dump([{'id':s['id'],'text':s['say']} for s in d['$F'] if s.get('say')],open('$EP/voice/$F/lines.json','w'),indent=1)"
    "$VV" "$ENG/voice/vv_lines.py" "$EP/voice/$F/lines.json" "$EP/voice/$F/out" --voice Frank 2>&1 | tr '\r' '\n' | grep -E "s audio in|Error|error" || true
    (cd "$LIB" && WHISPER_MODEL=small.en "$PY" core/tts/asr_check.py "$EP/voice/$F/lines.json" "$EP/voice/$F/out" --lang en > "$EP/voice/$F/asr.txt" 2>&1) || true
    grep -E "^DIFF|mismatches" "$EP/voice/$F/asr.txt" || true
    node "$ENG/tools/timeline.mjs" "$EP" $F
  done
}
size() { [ "$1" = short ] && echo 1080x1920 || echo 1920x1080; }
still() { mkdir -p "$EP/out/stills"; (cd "$LIB" && node core/render/still.mjs "$EP" $3 --size $(size $1) --q "film=$1" --out "$EP/out/stills/$1"); }
render() {
  cd "$LIB"
  for F in $FILMS; do
    node core/render/events.mjs "$EP" --size $(size $F) --q "film=$F" --out "$EP/out/$F/events.json"
    node core/render/video.mjs "$EP" --fps 24 --workers ${WORKERS:-4} --size $(size $F) --q "film=$F" --out "$EP/out/$F/video.mp4"
  done
}
finish() {
  for F in $FILMS; do
    "$PY" "$ENG/mix.py" "$EP" $F
    (cd "$LIB" && sh core/render/mux.sh "$EP/out/$F/video.mp4" "$EP/out/$F/mix.wav" "$EP/out/$F/master.mp4" 24 1) | grep -E " I:|LUFS|peak" | tail -n 2
    MB=$(( $(stat -c %s "$EP/out/$F/master.mp4") / 1048576 ))
    if [ $MB -lt 95 ]; then cp "$EP/out/$F/master.mp4" "$EP/${SLUG}_$F.mp4"; else
      D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$EP/out/$F/master.mp4")
      VK=$(python3 -c "print(int(90*8388.608/$D - 160))")
      (cd "$EP/out/$F" && ffmpeg -v error -y -i master.mp4 -c:v libx264 -b:v ${VK}k -preset medium -pass 1 -an -f null /dev/null && \
        ffmpeg -v error -y -i master.mp4 -c:v libx264 -b:v ${VK}k -preset medium -pass 2 -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a aac -b:a 160k "$EP/${SLUG}_$F.mp4"; rm -f ffmpeg2pass-0.log*)
    fi
    "$PY" "$LIB/core/render/srt.py" "$EP/out/$F/cues_srt.json" "$EP/${SLUG}_$F.srt"
    (cd "$LIB" && node core/render/readcheck.mjs "$EP" --size $(size $F) --q "film=$F" --step 0.25 > "$EP/out/$F/readcheck.txt" 2>&1) && echo "$F readcheck ok" || echo "$F readcheck: $(grep -c '^BAD' "$EP/out/$F/readcheck.txt") short holds (out/$F/readcheck.txt)"
    ffmpeg -i "$EP/${SLUG}_$F.mp4" -vf blackdetect=d=0.3:pix_th=0.1 -f null - 2>&1 | grep -c black_start | sed "s/^/$F black segments: /"
    ffmpeg -i "$EP/${SLUG}_$F.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+I:|Peak:" | tail -n 2 | sed "s/^/$F /"
    ls -la "$EP/${SLUG}_$F.mp4"
  done
  ffmpeg -v error -y -i "$EP/${SLUG}_long.mp4" -vf "fps=1/12,scale=320:-1,tile=8x7" -frames:v 1 "$EP/out/sheet_long.jpg" 2>/dev/null || true
  ffmpeg -v error -y -i "$EP/${SLUG}_short.mp4" -vf "fps=1/2.5,scale=180:-1,tile=10x2" -frames:v 1 "$EP/out/sheet_short.jpg" 2>/dev/null || true
}
case $STEP in prep) prep ;; voice) voice ;; still) still "$3" "$3" "$4" ;; render) render ;; finish) finish ;; all) prep; voice; render; finish ;; *) echo "unknown step $STEP"; exit 1 ;; esac
