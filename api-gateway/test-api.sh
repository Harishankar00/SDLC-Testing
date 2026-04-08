#!/bin/bash
# ==============================================================
# NoteStack - Module 06: Test API Endpoints
# ==============================================================
# Tests all API Gateway endpoints with Cognito authentication
# Usage: bash api-gateway/test-api.sh <email> <password>
# ==============================================================

API_URL="https://a1ebt6lln9.execute-api.ap-south-1.amazonaws.com/dev"
EMAIL=${1:-"notestack-sdlc-test@mailinator.com"}
PASSWORD=${2:-"Test@2026pass"}

echo "=== NoteStack API Tests ==="
echo "API: $API_URL"
echo ""

# Test without token
echo "[1] GET /notes without token (expect 401)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/notes")
echo "  -> Status: $STATUS"
echo ""

# Get token
echo "[2] Signing in to get ID Token..."
ID_TOKEN=$(node cognito/signIn.js "$EMAIL" "$PASSWORD" 2>&1 | grep -A1 "FULL ID TOKEN" | tail -1)
echo "  -> Token obtained (${#ID_TOKEN} chars)"
echo ""

# POST - Create
echo "[3] POST /notes (create note)..."
curl -s -X POST "$API_URL/notes" \
  -H "Content-Type: application/json" \
  -H "Authorization: $ID_TOKEN" \
  -d '{"title":"Test Note","content":"Hello from test script"}'
echo ""
echo ""

# GET - Read
echo "[4] GET /notes (list notes)..."
curl -s "$API_URL/notes" -H "Authorization: $ID_TOKEN"
echo ""
echo ""

echo "=== Tests Complete ==="
