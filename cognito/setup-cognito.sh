#!/bin/bash
# ==============================================================
# NoteStack - Module 04: Cognito User Pool Setup
# ==============================================================
# Creates:
#   - User Pool: NoteStack-Users-SDLC
#   - App Client: NoteStack-WebApp-SDLC (no client secret)
# ==============================================================

set -e

REGION="ap-south-1"
POOL_NAME="NoteStack-Users-SDLC"
CLIENT_NAME="NoteStack-WebApp-SDLC"

echo "=== NoteStack Cognito Setup ==="
echo "Region: $REGION"
echo ""

# Task 4.1: Create User Pool
echo "[Task 4.1] Creating User Pool: $POOL_NAME..."
POOL_ID=$(aws cognito-idp create-user-pool \
  --pool-name "$POOL_NAME" \
  --auto-verified-attributes email \
  --username-attributes email \
  --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireUppercase":true,"RequireLowercase":true,"RequireNumbers":true,"RequireSymbols":true}}' \
  --schema '[{"Name":"email","Required":true,"Mutable":true},{"Name":"name","Required":true,"Mutable":true}]' \
  --email-configuration EmailSendingAccount=COGNITO_DEFAULT \
  --region "$REGION" \
  --query 'UserPool.Id' --output text 2>&1)

echo "  -> User Pool created."
echo "  -> Pool ID: $POOL_ID"

# Create App Client (no client secret for frontend apps)
echo ""
echo "  Creating App Client: $CLIENT_NAME..."
CLIENT_ID=$(aws cognito-idp create-user-pool-client \
  --user-pool-id "$POOL_ID" \
  --client-name "$CLIENT_NAME" \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region "$REGION" \
  --query 'UserPoolClient.ClientId' --output text 2>&1)

echo "  -> App Client created."
echo "  -> Client ID: $CLIENT_ID"

echo ""
echo "=== Cognito Setup Complete ==="
echo ""
echo "========================================="
echo "  SAVE THESE VALUES - you need them!"
echo "========================================="
echo "  User Pool ID: $POOL_ID"
echo "  Client ID:    $CLIENT_ID"
echo "========================================="
