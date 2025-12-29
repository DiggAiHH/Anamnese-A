#!/bin/bash
# HISTORY-AWARE: Docker deployment script with dev-bypass mode
# This script builds and starts all services in Docker containers

set -e

echo "🐳 Anamnese-A Docker Deployment"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cat > .env << 'EOF'
# Development mode (bypasses PostgreSQL requirement)
DEV_BYPASS_PAYMENT=true

# Node.js
NODE_ENV=production

# Database (not used in dev-bypass mode)
DATABASE_URL=postgresql://anamnese_user:anamnese_password@db:5432/anamnese

# Stripe (dummy values in dev mode)
STRIPE_SECRET_KEY=sk_test_dummy
STRIPE_PUBLISHABLE_KEY=pk_test_dummy
STRIPE_WEBHOOK_SECRET=whsec_dummy

# Security
MASTER_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
SESSION_SECRET=my-super-secret-session-key-change-in-production

# URLs
FRONTEND_URL=http://localhost:3000
ANAMNESE_BASE_URL=http://localhost:8080
EOF
    echo "✅ .env created with dev-bypass mode"
    echo ""
fi

# Build Docker images
echo "📦 Building Docker images..."
docker compose build

echo ""
echo "🚀 Starting services..."
echo ""

# Start services
docker compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access the application:"
echo "   - Main Anamnese App:  http://localhost:8080/index_v8_complete.html"
echo "   - Payment Generator:  http://localhost:3000"
echo "   - Backend API:        http://localhost:3000/health"
echo ""
echo "📊 View logs:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker compose down"
echo ""
echo "🗑️  Clean up (including volumes):"
echo "   docker compose down -v"
echo ""
