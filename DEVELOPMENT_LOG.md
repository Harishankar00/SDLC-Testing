# NoteStack - Development Log

> Tracking milestones for the NoteStack Serverless Student Notes & File Sharing Platform built on AWS.

---

## Module 01 - IAM (Identity and Access Management) ✅

**Date:** 2026-04-06

### What was done
- Created IAM setup script (`iam/setup-iam.sh`) that provisions all required IAM resources
- Created IAM cleanup script (`iam/cleanup-iam.sh`) for resource teardown
- Defined the Lambda trust policy (`iam/trust-policy.json`)
- Defined custom CloudWatch Logs policy (`iam/notestack-lambda-basic-policy.json`)

### Resources Created
| Resource | Name | Purpose |
|----------|------|---------|
| IAM User | `notestack-intern` | Console access for the intern |
| IAM Group | `NoteStack-Interns` | Group with S3 + DynamoDB read-only access |
| Custom Policy | `NoteStack-LambdaBasic` | Allows CloudWatch Logs (CreateLogGroup, CreateLogStream, PutLogEvents) |
| IAM Role | `NoteStack-Lambda-Role` | Execution role for all Lambda functions (DynamoDB + S3 + Logs) |

### Key Concepts Covered
- **IAM User** - individual identity with credentials
- **IAM Group** - collection of users sharing permissions
- **IAM Role** - temporary identity used by AWS services (Lambda)
- **IAM Policy** - JSON document defining allowed/denied actions
- **Principle of Least Privilege** - grant minimum permissions needed

### Files
```
iam/
├── setup-iam.sh                      # Creates all IAM resources
├── cleanup-iam.sh                    # Tears down all IAM resources
├── trust-policy.json                 # Lambda assume-role trust policy
└── notestack-lambda-basic-policy.json # Custom CloudWatch Logs policy
```

---
