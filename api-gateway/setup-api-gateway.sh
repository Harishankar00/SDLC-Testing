#!/bin/bash
# ==============================================================
# NoteStack - Module 06: API Gateway Setup
# ==============================================================
# Creates a REST API with:
#   - /notes resource (POST, GET, PUT, DELETE)
#   - /notes/upload-url resource (POST)
#   - Cognito Authorizer on all methods
#   - CORS enabled
#   - Deployed to "dev" stage
# ==============================================================

set -e

REGION="ap-south-1"
API_NAME="NoteStack-API-SDLC"
STAGE_NAME="dev"
ACCOUNT_ID="896823725438"
USER_POOL_ID="ap-south-1_MLQ6Ufbxy"

echo "=== NoteStack API Gateway Setup ==="
echo "Region: $REGION"
echo ""

# -----------------------------------------------
# Task 6.1: Create REST API
# -----------------------------------------------
echo "[Task 6.1] Creating REST API: $API_NAME..."
API_ID=$(aws apigateway create-rest-api \
  --name "$API_NAME" \
  --endpoint-configuration types=REGIONAL \
  --region "$REGION" \
  --query 'id' --output text)
echo "  -> API created. ID: $API_ID"

# Get root resource ID
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id "$API_ID" \
  --region "$REGION" \
  --query 'items[?path==`/`].id' --output text)
echo "  -> Root resource ID: $ROOT_ID"

# -----------------------------------------------
# Task 6.2: Create Resources
# -----------------------------------------------
echo ""
echo "[Task 6.2] Creating resources..."

# Create /notes
NOTES_ID=$(aws apigateway create-resource \
  --rest-api-id "$API_ID" \
  --parent-id "$ROOT_ID" \
  --path-part "notes" \
  --region "$REGION" \
  --query 'id' --output text)
echo "  -> /notes created. ID: $NOTES_ID"

# Create /notes/upload-url
UPLOAD_ID=$(aws apigateway create-resource \
  --rest-api-id "$API_ID" \
  --parent-id "$NOTES_ID" \
  --path-part "upload-url" \
  --region "$REGION" \
  --query 'id' --output text)
echo "  -> /notes/upload-url created. ID: $UPLOAD_ID"

# -----------------------------------------------
# Task 6.4: Create Cognito Authorizer
# -----------------------------------------------
echo ""
echo "[Task 6.4] Creating Cognito Authorizer..."
AUTH_ID=$(aws apigateway create-authorizer \
  --rest-api-id "$API_ID" \
  --name "NoteStack-CognitoAuth-SDLC" \
  --type COGNITO_USER_POOLS \
  --provider-arns "arn:aws:cognito-idp:${REGION}:${ACCOUNT_ID}:userpool/${USER_POOL_ID}" \
  --identity-source "method.request.header.Authorization" \
  --region "$REGION" \
  --query 'id' --output text)
echo "  -> Authorizer created. ID: $AUTH_ID"

# -----------------------------------------------
# Task 6.3: Create Methods & Link to Lambda
# -----------------------------------------------
echo ""
echo "[Task 6.3] Creating methods and integrations..."

# Helper function to create method + integration + permissions
create_method() {
  local RESOURCE_ID=$1
  local HTTP_METHOD=$2
  local FUNCTION_NAME=$3
  local RESOURCE_PATH=$4

  LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"
  LAMBDA_URI="arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${LAMBDA_ARN}/invocations"

  # Create method with Cognito authorizer
  aws apigateway put-method \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method "$HTTP_METHOD" \
    --authorization-type COGNITO_USER_POOLS \
    --authorizer-id "$AUTH_ID" \
    --region "$REGION" > /dev/null

  # Create Lambda integration
  aws apigateway put-integration \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method "$HTTP_METHOD" \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "$LAMBDA_URI" \
    --region "$REGION" > /dev/null

  # Grant API Gateway permission to invoke Lambda
  aws lambda add-permission \
    --function-name "$FUNCTION_NAME" \
    --statement-id "apigateway-${HTTP_METHOD}-${RESOURCE_ID}" \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/${HTTP_METHOD}${RESOURCE_PATH}" \
    --region "$REGION" > /dev/null 2>&1 || true

  echo "  -> $HTTP_METHOD $RESOURCE_PATH -> $FUNCTION_NAME"
}

create_method "$NOTES_ID" "POST" "NoteStack-CreateNote-SDLC" "/notes"
create_method "$NOTES_ID" "GET" "NoteStack-GetNotes-SDLC" "/notes"
create_method "$NOTES_ID" "PUT" "NoteStack-UpdateNote-SDLC" "/notes"
create_method "$NOTES_ID" "DELETE" "NoteStack-DeleteNote-SDLC" "/notes"
create_method "$UPLOAD_ID" "POST" "NoteStack-GenerateUploadUrl-SDLC" "/notes/upload-url"

# -----------------------------------------------
# Task 6.5: Enable CORS (OPTIONS method)
# -----------------------------------------------
echo ""
echo "[Task 6.5] Enabling CORS..."

enable_cors() {
  local RESOURCE_ID=$1
  local RESOURCE_PATH=$2

  # Create OPTIONS method (no auth)
  aws apigateway put-method \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --authorization-type NONE \
    --region "$REGION" > /dev/null

  # Mock integration for OPTIONS
  aws apigateway put-integration \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates '{"application/json": "{\"statusCode\": 200}"}' \
    --region "$REGION" > /dev/null

  # Method response
  aws apigateway put-method-response \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{"method.response.header.Access-Control-Allow-Headers":false,"method.response.header.Access-Control-Allow-Methods":false,"method.response.header.Access-Control-Allow-Origin":false}' \
    --region "$REGION" > /dev/null

  # Integration response with CORS headers
  aws apigateway put-integration-response \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,Authorization'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'GET,POST,PUT,DELETE,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' \
    --region "$REGION" > /dev/null

  echo "  -> CORS enabled on $RESOURCE_PATH"
}

enable_cors "$NOTES_ID" "/notes"
enable_cors "$UPLOAD_ID" "/notes/upload-url"

# -----------------------------------------------
# Task 6.6: Deploy
# -----------------------------------------------
echo ""
echo "[Task 6.6] Deploying to stage: $STAGE_NAME..."
aws apigateway create-deployment \
  --rest-api-id "$API_ID" \
  --stage-name "$STAGE_NAME" \
  --region "$REGION" > /dev/null

INVOKE_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com/${STAGE_NAME}"

echo ""
echo "=== API Gateway Setup Complete ==="
echo ""
echo "========================================="
echo "  API Details"
echo "========================================="
echo "  API ID:      $API_ID"
echo "  Stage:       $STAGE_NAME"
echo "  Invoke URL:  $INVOKE_URL"
echo "========================================="
echo ""
echo "  Endpoints:"
echo "    POST   $INVOKE_URL/notes           -> CreateNote"
echo "    GET    $INVOKE_URL/notes           -> GetNotes"
echo "    PUT    $INVOKE_URL/notes           -> UpdateNote"
echo "    DELETE $INVOKE_URL/notes           -> DeleteNote"
echo "    POST   $INVOKE_URL/notes/upload-url -> GenerateUploadUrl"
echo ""
echo "  All endpoints require Authorization header with Cognito ID Token."
