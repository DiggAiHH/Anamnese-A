#!/bin/bash
# Download Vosk-Browser for offline DSGVO-compliant speech recognition

set -e

VOSK_VERSION="0.0.9"
VOSK_DIR="public/lib/vosk"

mkdir -p "$VOSK_DIR"

echo "📥 Downloading Vosk-Browser v$VOSK_VERSION..."

curl -L -o "$VOSK_DIR/vosk.js" \
  "https://cdn.jsdelivr.net/npm/vosk-browser@$VOSK_VERSION/dist/vosk.js"

curl -L -o "$VOSK_DIR/vosk.wasm" \
  "https://cdn.jsdelivr.net/npm/vosk-browser@$VOSK_VERSION/dist/vosk.wasm"

echo "📥 Downloading German model (small)..."
curl -L -o "$VOSK_DIR/vosk-model-small-de-0.15.tar.gz" \
  "https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip"

echo "✅ Vosk-Browser heruntergeladen nach $VOSK_DIR"
echo "⚠️  Hinweis: Modell muss noch entpackt werden: tar -xzf vosk-model-small-de-0.15.tar.gz"
