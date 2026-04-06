#!/bin/bash
# ==============================================================
# NoteStack - Module 01: IAM Setup Script
# ==============================================================
# This script creates all IAM resources needed for NoteStack:
#   - IAM User:   notestack-intern
#   - IAM Group:  NoteStack-Interns (with S3 + DynamoDB read-only)
#   - Custom Policy: NoteStack-LambdaBasic (CloudWatch Logs)
#   - IAM Role:   NoteStack-Lambda-Role (for all Lambda functions)
# ==============================================================

set -e

REGION="ap-south-1"
echo "=== NoteStack IAM Setup ==="
echo "Region: $REGION"
echo ""

# -----------------------------------------------
# Task 1.1: Create IAM User
# -----------------------------------------------
echo "[Task 1.1] Creating IAM User: notestack-intern..."
aws iam create-user --user-name notestack-intern 2>/dev/null && \
  echo "  -> User created." || echo "  -> User already exists, skipping."

aws iam create-login-profile \
  --user-name notestack-intern \
  --password "NoteStack@2026" \
  --password-reset-required 2>/dev/null && \
  echo "  -> Console access enabled." || echo "  -> Login profile already exists, skipping."

echo ""

# -----------------------------------------------
# Task 1.2: Create IAM Group
# -----------------------------------------------
echo "[Task 1.2] Creating IAM Group: NoteStack-Interns..."
aws iam create-group --group-name NoteStack-Interns 2>/dev/null && \
  echo "  -> Group created." || echo "  -> Group already exists, skipping."

echo "  Attaching policies to group..."
aws iam attach-group-policy \
  --group-name NoteStack-Interns \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
echo "  -> AmazonS3ReadOnlyAccess attached."

aws iam attach-group-policy \
  --group-name NoteStack-Interns \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess
echo "  -> AmazonDynamoDBReadOnlyAccess attached."

echo "  Adding user to group..."
aws iam add-user-to-group \
  --user-name notestack-intern \
  --group-name NoteStack-Interns
echo "  -> notestack-intern added to NoteStack-Interns."
echo ""

# -----------------------------------------------
# Task 1.3: Create Custom Policy
# -----------------------------------------------
echo "[Task 1.3] Creating custom policy: NoteStack-LambdaBasic..."
POLICY_ARN=$(aws iam create-policy \
  --policy-name NoteStack-LambdaBasic \
  --policy-document file://iam/notestack-lambda-basic-policy.json \
  --query 'Policy.Arn' --output text 2>/dev/null) && \
  echo "  -> Policy created: $POLICY_ARN" || \
  echo "  -> Policy already exists, skipping."

# Get the policy ARN if it already existed
if [ -z "$POLICY_ARN" ]; then
  ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
  POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/NoteStack-LambdaBasic"
fi
echo ""

# -----------------------------------------------
# Task 1.4: Create IAM Role for Lambda
# -----------------------------------------------
echo "[Task 1.4] Creating IAM Role: NoteStack-Lambda-Role..."
aws iam create-role \
  --role-name NoteStack-Lambda-Role \
  --assume-role-policy-document file://iam/trust-policy.json 2>/dev/null && \
  echo "  -> Role created." || echo "  -> Role already exists, skipping."

echo "  Attaching policies to role..."

aws iam attach-role-policy \
  --role-name NoteStack-Lambda-Role \
  --policy-arn "$POLICY_ARN"
echo "  -> NoteStack-LambdaBasic attached."

aws iam attach-role-policy \
  --role-name NoteStack-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
echo "  -> AmazonDynamoDBFullAccess attached."

aws iam attach-role-policy \
  --role-name NoteStack-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
echo "  -> AmazonS3FullAccess attached."

echo ""
echo "=== IAM Setup Complete ==="
echo ""
echo "Resources created:"
echo "  User:    notestack-intern"
echo "  Group:   NoteStack-Interns"
echo "  Policy:  NoteStack-LambdaBasic"
echo "  Role:    NoteStack-Lambda-Role"
echo ""
echo "IMPORTANT: Save the NoteStack-Lambda-Role ARN!"
echo "  You will need it in Module 05 for all Lambda functions."

ROLE_ARN=$(aws iam get-role --role-name NoteStack-Lambda-Role --query 'Role.Arn' --output text 2>/dev/null)
if [ -n "$ROLE_ARN" ]; then
  echo "  Role ARN: $ROLE_ARN"
fi
