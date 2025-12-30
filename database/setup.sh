#!/bin/bash
# =============================================================================
# DATABASE SETUP SCRIPT - Seed Data für lokale Entwicklung
# =============================================================================
# HISTORY-AWARE: Initialisiert PostgreSQL mit Test-Daten
# DSGVO-SAFE: Keine echten Personendaten, nur Dummy-Daten

set -e

# PostgreSQL Connection
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-anamnese}"
DB_USER="${DB_USER:-anamnese_user}"
DB_PASSWORD="${DB_PASSWORD:-anamnese_password}"

echo "🚀 Anamnese-A Database Setup"
echo "================================"
echo "Host: $DB_HOST:$DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1; then
  echo "❌ PostgreSQL is not running or not reachable"
  echo "   Start with: docker-compose up -d db"
  exit 1
fi

echo "✅ PostgreSQL is reachable"

# Create database if not exists
echo "📦 Creating database '$DB_NAME'..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"

echo "✅ Database '$DB_NAME' exists"

# Run schema migration
echo "📝 Running schema migration..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/schema.sql

echo "✅ Schema migration complete"

SEEDS_FILE="database/seeds_auth.sql"

# Seed data (HISTORY-AWARE: seeds.sql is not schema-compatible; use auth seeds)
echo "🌱 Seeding test data..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$SEEDS_FILE"

echo "✅ Seed data inserted ($SEEDS_FILE)"

# Verify data
echo ""
echo "📊 Verification:"
echo "================================"
echo "Practices:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT id, name, subscription_tier FROM practices;"

echo ""
echo "Users:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT id, email, role FROM users;"

echo ""
echo "Codes:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT code, mode, language, payment_status FROM codes;"

echo ""
echo "✅ Database setup complete!"
echo ""
echo "🔐 Test Login Credentials:"
echo "   Email: test@example.com"
echo "   Password: password123"
echo ""
echo "🔗 Test Code: TEST1234"
echo ""
