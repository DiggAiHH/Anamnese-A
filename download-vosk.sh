#!/usr/bin/env bash
# Hardened download script for offline, DSGVO-compliant Vosk assets

set -euo pipefail

REQUIRED_BINS=(curl sha256sum unzip)
for bin in "${REQUIRED_BINS[@]}"; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "Missing dependency: $bin" >&2
    exit 1
  fi
done

VOSK_VERSION="0.0.8"
VOSK_DIR="public/lib/vosk"
MODEL_ROOT="models"
MODEL_NAME="vosk-model-small-de-0.15"
MODEL_DIR="${MODEL_ROOT}/${MODEL_NAME}"
MODEL_ARCHIVE="${MODEL_ROOT}/${MODEL_NAME}.zip"

declare -A VOSK_HASHES=(
  ["vosk.js"]="29504515526e974f4cb053cf08811c4de5fb2a74007c0a5a957db50eaa8d5d0c"
  ["vosk.wasm"]="d51a01d7b07a3b6f20ed3b5288bef4d70cca9aa4426065317603355a587b6d90"
)

MODEL_ARCHIVE_HASH="b7e53c90b1f0a38456f4cd62b366ecd58803cd97cd42b06438e2c131713d5e43"

VOSK_BASE_URLS=(
  "https://cdn.jsdelivr.net/npm/vosk-browser@${VOSK_VERSION}/dist"
  "https://unpkg.com/vosk-browser@${VOSK_VERSION}/dist"
)

MODEL_URLS=(
  "https://alphacephei.com/vosk/models/${MODEL_NAME}.zip"
  "https://alphacephei.com/vosk/models/${MODEL_NAME}.zip?download=1"
)

if [[ -n "${VOSK_MODEL_URL_OVERRIDE:-}" ]]; then
  MODEL_URLS=("${VOSK_MODEL_URL_OVERRIDE}" "${MODEL_URLS[@]}")
fi

verify_hash() {
  local file="$1"
  local expected="$2"
  local actual
  actual=$(sha256sum "$file" | awk '{print $1}')
  if [[ "$actual" == "$expected" ]]; then
    return 0
  fi
  echo "Expected hash $expected but received $actual for $file" >&2
  return 1
}

download_with_integrity() {
  local label="$1"
  local destination="$2"
  local expected_hash="$3"
  shift 3
  local urls=("$@")

  mkdir -p "$(dirname "$destination")"

  if [[ -f "$destination" ]]; then
    if verify_hash "$destination" "$expected_hash"; then
      echo "✅ $label already present (hash verified)"
      return 0
    fi
    echo "⚠️  Existing $label failed integrity check, re-downloading..."
    rm -f "$destination"
  fi

  for url in "${urls[@]}"; do
    local tmp
    tmp=$(mktemp "/tmp/${label}.XXXXXX")
    echo "⬇️  Downloading $label from $url"
    if curl -fSL "$url" -o "$tmp"; then
      if verify_hash "$tmp" "$expected_hash"; then
        mv "$tmp" "$destination"
        echo "✅ $label stored at $destination"
        rm -f "$tmp"
        return 0
      else
        echo "❌ Hash mismatch for $label from $url" >&2
      fi
    else
      echo "⚠️  Download failed from $url" >&2
    fi
    rm -f "$tmp"
  done

  echo "🚨 Unable to download $label with a trusted hash" >&2
  exit 1
}

echo "📁 Preparing directories..."
mkdir -p "$VOSK_DIR" "$MODEL_ROOT"

for artifact in "vosk.js" "vosk.wasm"; do
  local -a local_urls=()
  for base in "${VOSK_BASE_URLS[@]}"; do
    local_urls+=("${base}/${artifact}")
  done
  download_with_integrity "$artifact" "$VOSK_DIR/$artifact" "${VOSK_HASHES[$artifact]}" "${local_urls[@]}"
done

download_with_integrity "${MODEL_NAME}.zip" "$MODEL_ARCHIVE" "$MODEL_ARCHIVE_HASH" "${MODEL_URLS[@]}"
echo "${MODEL_ARCHIVE_HASH}  ${MODEL_NAME}.zip" > "${MODEL_ARCHIVE}.sha256"

if [[ -d "$MODEL_DIR" ]]; then
  echo "♻️  Replacing existing model directory at $MODEL_DIR"
  rm -rf "$MODEL_DIR"
fi

echo "📦 Extracting model archive..."
unzip -oq "$MODEL_ARCHIVE" -d "$MODEL_ROOT"
echo "✅ Model available at $MODEL_DIR"

echo "🎉 Finished downloading verified Vosk assets."
