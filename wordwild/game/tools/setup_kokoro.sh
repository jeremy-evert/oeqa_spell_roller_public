#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
LOCAL="$ROOT/.local/kokoro"
MODELS="$LOCAL/models"
VENV="$LOCAL/venv"

command -v uv >/dev/null || { echo "Install uv first: https://docs.astral.sh/uv/" >&2; exit 1; }
command -v curl >/dev/null || { echo "curl is required to download the model files." >&2; exit 1; }
command -v sha256sum >/dev/null || { echo "sha256sum is required to verify the model files." >&2; exit 1; }

mkdir -p "$MODELS"
uv venv --python 3.12 "$VENV"
uv pip install --python "$VENV/bin/python" kokoro-onnx==0.6.1 soundfile==0.14.0

MODEL_URL="https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"
MODEL="$MODELS/kokoro-v1.0.onnx"
VOICES="$MODELS/voices-v1.0.bin"
[[ -s "$MODEL" ]] || curl -fL --retry 2 -o "$MODEL" "$MODEL_URL/kokoro-v1.0.onnx"
[[ -s "$VOICES" ]] || curl -fL --retry 2 -o "$VOICES" "$MODEL_URL/voices-v1.0.bin"

printf '%s  %s\n%s  %s\n' \
  '7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5' "$MODEL" \
  'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d' "$VOICES" | sha256sum --check --status || {
    echo "Kokoro model checksum failed; remove the corrupt file and rerun setup." >&2
    exit 1
  }

echo "Kokoro ONNX 0.6.1 ready (Python 3.12, af_heart voice bundle)."
echo "Model files: $MODELS"
echo "Environment: $VENV"
