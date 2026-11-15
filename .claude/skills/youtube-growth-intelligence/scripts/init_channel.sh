#!/usr/bin/env bash
# Create youtube-growth/<channel>/ from the templates without overwriting anything that exists.
set -euo pipefail
ch="${1:?usage: init_channel.sh <channel>}"
here="$(cd "$(dirname "$0")/.." && pwd)"; root="$(cd "$here/../../.." && pwd)"
dst="$root/youtube-growth/$ch"
mkdir -p "$dst"/{research/competitor-analysis,research/trending-topics,research/topic-opportunities,analytics/daily,analytics/weekly,analytics/monthly,reports/growth-reports}
(cd "$here/templates" && find . -type f) | while read -r f; do
  out="$dst/${f#./}"; mkdir -p "$(dirname "$out")"
  [ -e "$out" ] || sed "s/{{CHANNEL}}/$ch/g" "$here/templates/${f#./}" > "$out"
done
for d in research/competitor-analysis research/trending-topics research/topic-opportunities analytics/daily analytics/monthly reports/growth-reports; do
  [ -n "$(ls -A "$dst/$d")" ] || touch "$dst/$d/.gitkeep"
done
echo "ready: youtube-growth/$ch"
