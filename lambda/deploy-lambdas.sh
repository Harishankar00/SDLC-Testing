#!/bin/bash
# ==============================================================
# NoteStack - Module 05: Deploy All Lambda Functions
# ==============================================================
# Deploys 5 Lambda functions to AWS:
#   - NoteStack-CreateNote-SDLC
#   - NoteStack-GetNotes-SDLC
#   - NoteStack-UpdateNote-SDLC
#   - NoteStack-DeleteNote-SDLC
#   - NoteStack-GenerateUploadUrl-SDLC
# ==============================================================

set -e

REGION="ap-south-1"
ROLE_ARN="arn:aws:iam::896823725438:role/NoteStack-Lambda-Role"
RUNTIME="nodejs20.x"
TIMEOUT=30
MEMORY=128

FUNCTIONS=("CreateNote" "GetNotes" "UpdateNote" "DeleteNote" "GenerateUploadUrl")

echo "=== NoteStack Lambda Deployment ==="
echo "Region: $REGION"
echo "Runtime: $RUNTIME"
echo ""

for FUNC in "${FUNCTIONS[@]}"; do
  FUNC_NAME="NoteStack-${FUNC}-SDLC"
  FUNC_DIR="lambda/${FUNC}"

  echo "[Deploying] $FUNC_NAME..."

  # Install dependencies into function directory
  cp package.json "$FUNC_DIR/package.json" 2>/dev/null || true
  cd "$FUNC_DIR"
  npm install --production --silent 2>/dev/null

  # Create zip
  zip -r "/tmp/${FUNC_NAME}.zip" . -x "*.sh" > /dev/null

  # Check if function exists
  if aws lambda get-function --function-name "$FUNC_NAME" --region "$REGION" > /dev/null 2>&1; then
    # Update existing function
    aws lambda update-function-code \
      --function-name "$FUNC_NAME" \
      --zip-file "fileb:///tmp/${FUNC_NAME}.zip" \
      --region "$REGION" \
      --query 'FunctionName' --output text > /dev/null
    echo "  -> Updated."
  else
    # Create new function
    aws lambda create-function \
      --function-name "$FUNC_NAME" \
      --runtime "$RUNTIME" \
      --role "$ROLE_ARN" \
      --handler index.handler \
      --zip-file "fileb:///tmp/${FUNC_NAME}.zip" \
      --timeout "$TIMEOUT" \
      --memory-size "$MEMORY" \
      --region "$REGION" \
      --query 'FunctionName' --output text > /dev/null
    echo "  -> Created."
  fi

  cd - > /dev/null
  rm -f "/tmp/${FUNC_NAME}.zip"
done

echo ""
echo "=== Lambda Deployment Complete ==="
echo ""
echo "Functions deployed:"
for FUNC in "${FUNCTIONS[@]}"; do
  echo "  - NoteStack-${FUNC}-SDLC"
done
