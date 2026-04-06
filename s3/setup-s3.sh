#!/bin/bash
# ==============================================================
# NoteStack - Module 02: S3 Bucket Setup
# ==============================================================
# Creates the S3 bucket for file storage with:
#   - Block all public access
#   - Folder structure: users/{userId}/notes/{files}
# ==============================================================

set -e

REGION="ap-south-1"
BUCKET_NAME="notestack-files-sdlc-2026"

echo "=== NoteStack S3 Setup ==="
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Task 2.1: Create S3 Bucket
echo "[Task 2.1] Creating S3 Bucket..."
aws s3api create-bucket \
  --bucket "$BUCKET_NAME" \
  --region "$REGION" \
  --create-bucket-configuration LocationConstraint="$REGION" 2>&1 && \
  echo "  -> Bucket created." || echo "  -> Bucket may already exist."

# Block all public access
echo "  Blocking all public access..."
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
echo "  -> Public access blocked."

# Task 2.2: Create folder structure
echo ""
echo "[Task 2.2] Creating folder structure..."
aws s3api put-object --bucket "$BUCKET_NAME" --key "users/" --content-length 0 2>&1
echo "  -> users/ folder created."
aws s3api put-object --bucket "$BUCKET_NAME" --key "users/test-user/notes/" --content-length 0 2>&1
echo "  -> users/test-user/notes/ folder created."
aws s3api put-object --bucket "$BUCKET_NAME" --key "users/test-user/profile/" --content-length 0 2>&1
echo "  -> users/test-user/profile/ folder created."

echo ""
echo "=== S3 Setup Complete ==="
echo "Bucket Name: $BUCKET_NAME"
echo "Bucket ARN:  arn:aws:s3:::$BUCKET_NAME"
