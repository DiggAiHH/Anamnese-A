#!/bin/bash
# Download Vosk-Browser for offline DSGVO-compliant speech recognition

set -e

VOSK_VERSION="0.0.9"
VOSK_DIR="public/lib/vosk"
MODEL_NAME="vosk-model-small-de-0.15"
MODEL_DIR="public/models/${MODEL_NAME}"

mkdir -p "$VOSK_DIR"

echo "📥 Downloading Vosk-Browser v$VOSK_VERSION..."

curl -L -o "$VOSK_DIR/vosk.js" \
  "https://cdn.jsdelivr.net/npm/vosk-browser@$VOSK_VERSION/dist/vosk.js"

curl -L -o "$VOSK_DIR/vosk.wasm" \
  "https://cdn.jsdelivr.net/npm/vosk-browser@$VOSK_VERSION/dist/vosk.wasm"

echo "📥 Downloading German model (small)..."
mkdir -p "$MODEL_DIR"

echo "📥 Downloading German model (small)..."
curl -L -o "/tmp/${MODEL_NAME}.zip" \
  "https://alphacephei.com/vosk/models/${MODEL_NAME}.zip"

echo "📦 Extracting model to $MODEL_DIR ..."
unzip -o "/tmp/${MODEL_NAME}.zip" -d public/models >/tmp/vosk-unzip.log

echo "✅ Vosk-Browser heruntergeladen nach $VOSK_DIR"
echo "✅ Modell entpackt nach $MODEL_DIR"
