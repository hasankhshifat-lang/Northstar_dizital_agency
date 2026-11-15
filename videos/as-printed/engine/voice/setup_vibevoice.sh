#!/bin/sh
# One-time per session: VibeVoice-1.5B (Microsoft, MIT) on CPU in its own venv at /root/vv; the weights (5.4 GB) are
# cached in ~/.cache/huggingface on first use. Safe to run again (skips what is there).
set -e
[ -x /root/vv/bin/python ] || python3 -m venv /root/vv
/root/vv/bin/python -c "import vibevoice, torch" 2>/dev/null || {
  /root/vv/bin/pip install -q --upgrade pip
  /root/vv/bin/pip install -q torch --index-url https://download.pytorch.org/whl/cpu
  /root/vv/bin/pip install -q vibevoice soundfile
}
/root/vv/bin/python -c "from huggingface_hub import snapshot_download; snapshot_download('microsoft/VibeVoice-1.5B')" >/dev/null 2>&1
echo "vibevoice ready"
