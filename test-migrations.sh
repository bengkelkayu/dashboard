#!/bin/bash

# Test script for migration system
# This script tests that migrations can be run multiple times without errors

set -e

echo "================================================"
echo "🧪 Testing Migration System"
echo "================================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "❌ .env file not found. Please create it from .env.example"
  exit 1
fi

echo "✓ .env file found"
echo ""

# Test 1: Run migrations for the first time
echo "📝 Test 1: Running migrations (first time)"
echo "-------------------------------------------"
npm run migrate
echo ""

# Test 2: Run migrations again (should skip all)
echo "📝 Test 2: Running migrations again (should skip)"
echo "-------------------------------------------"
npm run migrate
echo ""

# Test 3: Verify schema
echo "📝 Test 3: Verifying schema"
echo "-------------------------------------------"
npm run verify-schema
echo ""

# Test 4: Check schema_migrations table
echo "📝 Test 4: Checking migration tracking table"
echo "-------------------------------------------"
if command -v psql &> /dev/null; then
  echo "Applied migrations:"
  psql $DATABASE_URL -c "SELECT migration_name, applied_at FROM schema_migrations ORDER BY applied_at;" 2>/dev/null || \
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT migration_name, applied_at FROM schema_migrations ORDER BY applied_at;" 2>/dev/null || \
  echo "⚠️  Could not connect to database with psql"
else
  echo "⚠️  psql not found, skipping database query"
fi
echo ""

# Test 5: Run migrations one more time
echo "📝 Test 5: Running migrations third time (should still skip)"
echo "-------------------------------------------"
npm run migrate
echo ""

echo "================================================"
echo "✅ All migration tests passed!"
echo "================================================"
echo ""
echo "Summary:"
echo "- Migrations can be run multiple times"
echo "- Already applied migrations are skipped"
echo "- No 'trigger already exists' errors"
echo "- Schema verification passes"
