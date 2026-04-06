#!/bin/bash
# ==============================================================
# NoteStack - Module 01: IAM Cleanup Script
# Removes all IAM resources created by setup-iam.sh
# ==============================================================

set -e

echo "=== NoteStack IAM Cleanup ==="
echo ""

ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/NoteStack-LambdaBasic"

# Remove user from group
echo "Removing notestack-intern from NoteStack-Interns..."
aws iam remove-user-from-group \
  --user-name notestack-intern \
  --group-name NoteStack-Interns 2>/dev/null || true

# Delete login profile
echo "Deleting login profile for notestack-intern..."
aws iam delete-login-profile --user-name notestack-intern 2>/dev/null || true

# Delete user
echo "Deleting user: notestack-intern..."
aws iam delete-user --user-name notestack-intern 2>/dev/null || true

# Detach group policies and delete group
echo "Detaching policies from NoteStack-Interns..."
aws iam detach-group-policy --group-name NoteStack-Interns \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess 2>/dev/null || true
aws iam detach-group-policy --group-name NoteStack-Interns \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess 2>/dev/null || true
echo "Deleting group: NoteStack-Interns..."
aws iam delete-group --group-name NoteStack-Interns 2>/dev/null || true

# Detach role policies and delete role
echo "Detaching policies from NoteStack-Lambda-Role..."
aws iam detach-role-policy --role-name NoteStack-Lambda-Role \
  --policy-arn "$POLICY_ARN" 2>/dev/null || true
aws iam detach-role-policy --role-name NoteStack-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess 2>/dev/null || true
aws iam detach-role-policy --role-name NoteStack-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess 2>/dev/null || true
aws iam detach-role-policy --role-name NoteStack-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite 2>/dev/null || true
echo "Deleting role: NoteStack-Lambda-Role..."
aws iam delete-role --role-name NoteStack-Lambda-Role 2>/dev/null || true

# Delete custom policy
echo "Deleting policy: NoteStack-LambdaBasic..."
aws iam delete-policy --policy-arn "$POLICY_ARN" 2>/dev/null || true

echo ""
echo "=== IAM Cleanup Complete ==="
