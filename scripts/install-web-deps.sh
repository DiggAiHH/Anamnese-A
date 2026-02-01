#!/bin/bash

echo "========================================="
echo "klaproth - Web Dependencies Installation"
echo "========================================="

cd /workspaces/Anamnese-A

echo ""
echo "Installing dependencies with --legacy-peer-deps..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "Next steps:"
    echo "  npm run web        # Start development server"
    echo "  npm run build:web  # Build for production"
else
    echo ""
    echo "❌ Installation failed!"
    exit 1
fi
