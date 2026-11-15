#!/usr/bin/env bash
# Installs Microsoft VibeVoice (CPU) into /opt/VibeVoice with its own venv at /opt/vibevoice-env.
# Safe to run again: it skips work that is already done. The Default cloud environment's setup
# script runs the same steps at session start, so this is usually a no-op.
set -e
export PATH="/root/.local/bin:$HOME/.local/bin:$PATH"
VV=/opt/VibeVoice; ENV=/opt/vibevoice-env
if [ -x "$ENV/bin/python" ] && "$ENV/bin/python" -c "import vibevoice" 2>/dev/null; then
  echo "VibeVoice already installed"; exit 0
fi
command -v uv >/dev/null || pip install -q uv
[ -d "$VV/.git" ] || git clone -q --depth 1 https://github.com/microsoft/VibeVoice.git "$VV"
# The bundled official voice presets can't be read by torch>=2.6's safe loader; load only those in full mode.
sed -i 's/map_location=target_device, weights_only=True)/map_location=target_device, weights_only=False)/' "$VV/demo/realtime_model_inference_from_file.py"
sed -i '/preset_path,$/,/weights_only=True,/s/weights_only=True,/weights_only=False,/' "$VV/demo/web/app.py"
[ -x "$ENV/bin/python" ] || uv venv -q -p 3.13 "$ENV"
VIRTUAL_ENV=$ENV uv pip install -q torch torchaudio --index-url https://download.pytorch.org/whl/cpu
VIRTUAL_ENV=$ENV uv pip install -q -e "$VV"
"$ENV/bin/python" -c "import vibevoice; print('VibeVoice installed')"
