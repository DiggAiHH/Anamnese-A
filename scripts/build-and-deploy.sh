#!/bin/bash

echo "========================================="
echo "klaproth - Web Build & Deploy"
echo "========================================="

cd /workspaces/Anamnese-A

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install --legacy-peer-deps
fi

echo ""
echo "Building web application..."
npm run build:web

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    
    # Check if build directory exists
    if [ -d "build/web" ]; then
        echo "📦 Build output location: build/web"
        echo "📊 Build size:"
        du -sh build/web
        echo ""
        
        # Check if netlify CLI is installed
        if command -v netlify &> /dev/null; then
            echo "🚀 Netlify CLI found. Ready to deploy!"
            echo ""
            read -p "Deploy to Netlify now? (y/n) " -n 1 -r
            echo ""
            
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo "Deploying to Netlify..."
                netlify deploy --prod --dir=build/web
                
                if [ $? -eq 0 ]; then
                    echo ""
                    echo "✅ Deployment successful!"
                else
                    echo ""
                    echo "❌ Deployment failed!"
                    exit 1
                fi
            else
                echo "Skipping deployment. You can deploy later with:"
                echo "  netlify deploy --prod --dir=build/web"
            fi
        else
            echo "⚠️  Netlify CLI not found. Install with:"
            echo "  npm install -g netlify-cli"
            echo ""
            echo "Then run:"
            echo "  netlify login"
            echo "  netlify init"
            echo "  netlify deploy --prod --dir=build/web"
        fi
        
        echo ""
        echo "To test locally, run:"
        echo "  npx serve build/web"
    else
        echo "❌ Build directory not found!"
        exit 1
    fi
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi
