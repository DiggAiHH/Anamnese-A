#!/bin/bash
# MINIMAL Deploy Script (nur Build, kein npm install)
# Für den Fall, dass Dependencies bereits installiert sind

set -e

echo "======================================"
echo "  klaproth Quick Build"
echo "======================================"
echo ""

# TypeScript Check (optional skip with SKIP_TS=1)
if [ -z "$SKIP_TS" ]; then
  echo "[1/3] TypeScript Check..."
  npx tsc --noEmit
  echo "✓ TypeScript OK"
  echo ""
fi

# Build
echo "[2/3] Building..."
npm run build:web
echo "✓ Build complete"
echo ""

# Verify
echo "[3/3] Verification..."
ls -lh build/web/ | head -10
echo ""
echo "✓ Ready for deployment"
echo ""
echo "Deploy with: netlify deploy --prod --dir=build/web"
