#!/bin/bash
# ==============================================================
# NoteStack - Module 03: DynamoDB Table Setup
# ==============================================================
# Creates the NoteStack-Notes-SDLC table with:
#   - Partition Key: userId (String)
#   - Sort Key: noteId (String)
#   - Billing Mode: On-Demand (PAY_PER_REQUEST)
# ==============================================================

set -e

REGION="ap-south-1"
TABLE_NAME="NoteStack-Notes-SDLC"

echo "=== NoteStack DynamoDB Setup ==="
echo "Table: $TABLE_NAME"
echo "Region: $REGION"
echo ""

# Task 3.1: Create DynamoDB Table
echo "[Task 3.1] Creating DynamoDB Table..."
aws dynamodb create-table \
  --table-name "$TABLE_NAME" \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=noteId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=noteId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" \
  --query 'TableDescription.TableName' --output text 2>&1 && \
  echo "  -> Table created." || echo "  -> Table may already exist."

# Wait for table to become active
echo "  Waiting for table to become ACTIVE..."
aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"
echo "  -> Table is ACTIVE."

echo ""
echo "=== DynamoDB Setup Complete ==="
echo "Table Name: $TABLE_NAME"
echo "Partition Key: userId (String)"
echo "Sort Key: noteId (String)"
echo "Billing: On-Demand (pay per request)"
