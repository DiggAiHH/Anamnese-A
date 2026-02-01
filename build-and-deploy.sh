#!/bin/bash
# Build and Deploy Script for klaproth

set -e  # Exit on error

echo "🚀 klaproth - Build & Deploy Script"
echo "===================================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1/4: Installing dependencies..."
npm install --legacy-peer-deps
echo "✅ Dependencies installed"
echo ""

# Step 2: Build web app
echo "🔨 Step 2/4: Building web app..."
npm run build:web
echo "✅ Web build complete"
echo ""

# Step 3: Test build locally (optional)
echo "🧪 Step 3/4: Testing build..."
if [ -d "build/web" ]; then
  echo "✅ Build directory exists"
  echo "📁 Build contents:"
  ls -lh build/web/
else
  echo "❌ Build directory not found!"
  exit 1
fi
echo ""

# Step 4: Deploy instructions
echo "🌐 Step 4/4: Ready for Netlify deployment"
echo ""
echo "Run the following commands to deploy:"
echo "  netlify login"
echo "  netlify init --manual"
echo "  # Site name: klaproth"
echo "  netlify deploy --prod --dir=build/web"
echo ""
echo "Or test locally with:"
echo "  npx serve build/web -l 3000"
echo ""
echo "✅ Script complete!"
