#!/bin/bash
# ==============================================================
# NoteStack - Module 07: Secrets Manager Setup
# ==============================================================
# Creates secret: notestack/config-sdlc
# Stores: NOTIFICATION_API_KEY, APP_SECRET, ALLOWED_FILE_TYPES
# ==============================================================

set -e

REGION="ap-south-1"
SECRET_NAME="notestack/config-sdlc"

echo "=== NoteStack Secrets Manager Setup ==="
echo "Region: $REGION"
echo ""

# Task 7.1: Create Secret
echo "[Task 7.1] Creating secret: $SECRET_NAME..."
aws secretsmanager create-secret \
  --name "$SECRET_NAME" \
  --secret-string '{"NOTIFICATION_API_KEY":"ntfy-demo-key-12345","APP_SECRET":"notestack-secret-sdlc-2026","ALLOWED_FILE_TYPES":"pdf,jpg,png,docx"}' \
  --region "$REGION" \
  --query 'Name' --output text 2>&1 && \
  echo "  -> Secret created." || echo "  -> Secret may already exist."

echo ""
echo "=== Secrets Manager Setup Complete ==="
echo "Secret Name: $SECRET_NAME"
echo "Keys stored: NOTIFICATION_API_KEY, APP_SECRET, ALLOWED_FILE_TYPES"
