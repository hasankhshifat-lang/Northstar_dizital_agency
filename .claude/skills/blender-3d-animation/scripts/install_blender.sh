#!/usr/bin/env bash
# Installs the official Blender LTS Linux build (from download.blender.org) to /opt/blender
# and links `blender` into /usr/local/bin. Safe to re-run.
set -euo pipefail
VERSION="${BLENDER_VERSION:-4.5.9}"
SERIES="${VERSION%.*}"
DIR="/opt/blender-${VERSION}-linux-x64"
if command -v blender >/dev/null && blender --version 2>/dev/null | grep -q "Blender ${VERSION}"; then
  echo "Blender ${VERSION} already installed"; exit 0
fi
TMP="$(mktemp -d)"
curl -sSfL -o "$TMP/blender.tar.xz" \
  "https://download.blender.org/release/Blender${SERIES}/blender-${VERSION}-linux-x64.tar.xz"
tar -xf "$TMP/blender.tar.xz" -C /opt
rm -rf "$TMP"
ln -sfn "$DIR" /opt/blender
ln -sf /opt/blender/blender /usr/local/bin/blender
blender --version | head -1
