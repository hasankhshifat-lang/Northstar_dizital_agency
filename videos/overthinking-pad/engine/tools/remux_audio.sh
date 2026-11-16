#!/bin/sh
# remux.sh <final.mp4> <mix.wav>: new audio (-14 LUFS two-pass, limited, AAC 160k) onto the existing video stream (copied)
set -e
V="$1"; A="$2"; T="${V%.mp4}.tmp.mp4"
M=$(ffmpeg -hide_banner -i "$A" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
F="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=192000,alimiter=limit=0.79:level=false,aresample=48000"
ffmpeg -v error -y -i "$V" -i "$A" -map 0:v -map 1:a -c:v copy -af "$F" -c:a aac -b:a 160k -shortest -movflags +faststart "$T"
mv "$T" "$V"
ffmpeg -i "$V" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
