#!/bin/bash
# ONE-COMMAND START SCRIPT
# HISTORY-AWARE: User wants "one command to rule them all"
# DSGVO-SAFE: Local development server only

set -e

echo "======================================================================"
echo "🚀 ANAMNESE-A - One-Command Start"
echo "======================================================================"
echo ""

cd "$(dirname "$0")/.."

# Check Docker availability
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker detected - Starting with docker-compose..."
    echo ""
    
    # Build if not exists
    if [ -z "$(docker images -q anamnese-a 2> /dev/null)" ]; then
        echo "📦 Building Docker image..."
        docker-compose build
        echo ""
    fi
    
    # Start services
    echo "🐳 Starting containers..."
    docker-compose up -d
    
    echo ""
    echo "✅ Server running in Docker!"
    echo "🌐 URL: http://localhost:8080/"
    echo ""
    echo "Commands:"
    echo "  docker-compose logs -f    # View logs"
    echo "  docker-compose down       # Stop"
    echo "  docker-compose restart    # Restart"
    
else
    echo "⚠️  Docker not available - Starting Python server..."
    echo ""
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ ERROR: Python 3 not found!"
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
        echo ""
    fi
    
    # Start dev server
    echo "🐍 Starting Python dev server..."
    python3 dev-server.py &
    SERVER_PID=$!
    
    sleep 2
    
    echo ""
    echo "✅ Server running on PID $SERVER_PID"
    echo "🌐 URL: http://localhost:8080/"
    echo ""
    echo "Commands:"
    echo "  kill $SERVER_PID          # Stop server"
    echo "  curl http://localhost:8080/  # Test"
    echo ""
    echo "Opening browser..."
    sleep 1
    
    # Open browser (cross-platform)
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:8080/ 2>/dev/null &
    elif command -v open &> /dev/null; then
        open http://localhost:8080/ 2>/dev/null &
    else
        echo "⚠️  Could not open browser automatically"
    fi
fi

echo "======================================================================"
