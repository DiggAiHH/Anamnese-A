#!/bin/bash
# QUICK BUILD & DEPLOY - klaproth
# Execute this in VS Code terminal

set -e
cd /workspaces/Anamnese-A

echo "🚀 klaproth - Quick Build"
echo "========================="
echo ""

# Install
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps 2>&1 | tail -20
echo ""

# Build
echo "🔨 Building for web..."
npm run build:web 2>&1 | tail -30
echo ""

# Success
if [ -d "build/web" ]; then
  echo "✅ BUILD SUCCESSFUL!"
  echo ""
  echo "📁 Output: build/web/"
  ls -lh build/web/ | head -10
  echo ""
  echo "🌐 Deploy now:"
  echo "  netlify deploy --prod --dir=build/web"
  echo ""
  echo "Or test locally:"
  echo "  npx serve build/web -l 3000"
else
  echo "❌ BUILD FAILED - check errors above"
  exit 1
fi
