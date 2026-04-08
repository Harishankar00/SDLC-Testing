#!/bin/bash
# ==============================================================
# NoteStack - Module 08: CloudWatch Monitoring Setup
# ==============================================================
# Creates:
#   - SNS Topic for alarm notifications
#   - CloudWatch Alarm on CreateNote Lambda errors
#   - CloudWatch Dashboard with Lambda metrics
# ==============================================================

set -e

REGION="ap-south-1"
ACCOUNT_ID="896823725438"
SNS_TOPIC="NoteStack-Alerts-SDLC"
ALARM_NAME="NoteStack-CreateNote-HighErrors-SDLC"
DASHBOARD_NAME="NoteStack-Dashboard-SDLC"

echo "=== NoteStack CloudWatch Setup ==="
echo "Region: $REGION"
echo ""

# Task 8.4: Create SNS Topic for notifications
echo "[Task 8.4a] Creating SNS Topic: $SNS_TOPIC..."
TOPIC_ARN=$(aws sns create-topic \
  --name "$SNS_TOPIC" \
  --region "$REGION" \
  --query 'TopicArn' --output text)
echo "  -> Topic ARN: $TOPIC_ARN"
echo ""
echo "  NOTE: To receive email alerts, subscribe with:"
echo "  aws sns subscribe --topic-arn $TOPIC_ARN --protocol email --notification-endpoint YOUR_EMAIL --region $REGION"
echo ""

# Task 8.4b: Create Metric Alarm
echo "[Task 8.4b] Creating alarm: $ALARM_NAME..."
aws cloudwatch put-metric-alarm \
  --alarm-name "$ALARM_NAME" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=FunctionName,Value=NoteStack-CreateNote-SDLC \
  --alarm-actions "$TOPIC_ARN" \
  --region "$REGION"
echo "  -> Alarm created (triggers when errors > 5 in 5 minutes)."

# Task 8.5: Create Dashboard
echo ""
echo "[Task 8.5] Creating dashboard: $DASHBOARD_NAME..."

DASHBOARD_BODY='{
  "widgets": [
    {
      "type": "metric",
      "x": 0, "y": 0, "width": 12, "height": 6,
      "properties": {
        "title": "Lambda Invocations",
        "metrics": [
          ["AWS/Lambda", "Invocations", "FunctionName", "NoteStack-CreateNote-SDLC"],
          ["...", "NoteStack-GetNotes-SDLC"],
          ["...", "NoteStack-UpdateNote-SDLC"],
          ["...", "NoteStack-DeleteNote-SDLC"],
          ["...", "NoteStack-GenerateUploadUrl-SDLC"]
        ],
        "region": "ap-south-1",
        "period": 300,
        "stat": "Sum",
        "view": "timeSeries"
      }
    },
    {
      "type": "metric",
      "x": 12, "y": 0, "width": 12, "height": 6,
      "properties": {
        "title": "Lambda Errors",
        "metrics": [
          ["AWS/Lambda", "Errors", "FunctionName", "NoteStack-CreateNote-SDLC"],
          ["...", "NoteStack-GetNotes-SDLC"],
          ["...", "NoteStack-UpdateNote-SDLC"],
          ["...", "NoteStack-DeleteNote-SDLC"],
          ["...", "NoteStack-GenerateUploadUrl-SDLC"]
        ],
        "region": "ap-south-1",
        "period": 300,
        "stat": "Sum",
        "view": "timeSeries"
      }
    },
    {
      "type": "metric",
      "x": 0, "y": 6, "width": 12, "height": 6,
      "properties": {
        "title": "Lambda Duration (ms)",
        "metrics": [
          ["AWS/Lambda", "Duration", "FunctionName", "NoteStack-CreateNote-SDLC"],
          ["...", "NoteStack-GetNotes-SDLC"],
          ["...", "NoteStack-UpdateNote-SDLC"],
          ["...", "NoteStack-DeleteNote-SDLC"],
          ["...", "NoteStack-GenerateUploadUrl-SDLC"]
        ],
        "region": "ap-south-1",
        "period": 300,
        "stat": "Average",
        "view": "timeSeries"
      }
    }
  ]
}'

aws cloudwatch put-dashboard \
  --dashboard-name "$DASHBOARD_NAME" \
  --dashboard-body "$DASHBOARD_BODY" \
  --region "$REGION" > /dev/null
echo "  -> Dashboard created with 3 widgets (Invocations, Errors, Duration)."

echo ""
echo "=== CloudWatch Setup Complete ==="
echo ""
echo "Resources:"
echo "  SNS Topic:  $TOPIC_ARN"
echo "  Alarm:      $ALARM_NAME"
echo "  Dashboard:  $DASHBOARD_NAME"
