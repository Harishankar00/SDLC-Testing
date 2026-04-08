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

## Module 02 - S3 Bucket (Simple Storage Service) ✅

**Date:** 2026-04-06

### What was done
- Created and deployed S3 bucket `notestack-files-sdlc-2026` in ap-south-1
- Set up folder structure: `users/{userId}/notes/`
- Built and tested 4 Node.js scripts: upload, download, list, pre-signed URL generation
- All public access blocked on the bucket

### Resources Created
| Resource | Name | Purpose |
|----------|------|---------|
| S3 Bucket | `notestack-files-sdlc-2026` | File storage for student notes and uploads |

### Key Concepts Covered
- **Bucket** - top-level container, globally unique name
- **Object** - a file stored in a bucket (Key + Value + Metadata)
- **Prefix** - simulated folder paths using `/` in key names
- **Pre-signed URL** - temporary secure link for upload/download without AWS credentials
- **Bucket Policy** - JSON rules for bucket-level access control

### Files
```
s3/
├── setup-s3.sh       # Creates bucket and folder structure
├── upload.js         # Upload a local file to S3
├── download.js       # Download and display a file from S3
├── list.js           # List files under a prefix/folder
└── presigned-url.js  # Generate a temporary pre-signed URL
```

---

## Module 03 - DynamoDB (NoSQL Database) ✅

**Date:** 2026-04-06

### What was done
- Created new DynamoDB table `NoteStack-Notes-SDLC` in ap-south-1
- Partition Key: `userId` (String), Sort Key: `noteId` (String)
- On-Demand billing mode (pay per request)
- Built and tested 5 CRUD scripts: PutItem, GetItem, Query, UpdateItem, DeleteItem

### Resources Created
| Resource | Name | Purpose |
|----------|------|---------|
| DynamoDB Table | `NoteStack-Notes-SDLC` | Stores all user notes (userId + noteId composite key) |

### Key Concepts Covered
- **Table** - collection of data, only primary key defined at creation
- **Item** - a single row, max 400 KB
- **Partition Key** - groups items for fast lookup (userId)
- **Sort Key** - orders items within a partition (noteId)
- **GSI** - query data by a different key than the primary key
- **On-Demand vs Provisioned** - pay per request vs pre-set capacity

### Files
```
dynamodb/
├── setup-dynamodb.sh  # Creates the DynamoDB table
├── putItem.js         # Create a note
├── getItem.js         # Read one note by userId + noteId
├── query.js           # Read all notes for a user
├── updateItem.js      # Update a note's title and content
└── deleteItem.js      # Delete a note
```

---

## Module 04 - Cognito (User Authentication) ✅

**Date:** 2026-04-08

### What was done
- Created new User Pool `NoteStack-Users-SDLC` with email sign-in
- Created App Client `NoteStack-WebApp-SDLC` (no client secret, for frontend use)
- Built and tested 6 auth scripts: signUp, confirmSignUp, signIn, getUser, resetPassword, decodeToken
- Tested full auth flow: sign up -> confirm -> sign in -> decode JWT

### Resources Created
| Resource | Name | ID |
|----------|------|----|
| User Pool | `NoteStack-Users-SDLC` | `ap-south-1_MLQ6Ufbxy` |
| App Client | `NoteStack-WebApp-SDLC` | `6f0nh23edpc0idlfjkr8no45h2` |

### Key Concepts Covered
- **User Pool** - managed user directory with password policies and email verification
- **App Client** - configuration representing your app, provides Client ID
- **ID Token** - contains user info (name, email, sub), sent in API Authorization header
- **Access Token** - proves user is authenticated, used for getting user profile
- **Refresh Token** - silently renews expired tokens (lasts 30 days)
- **sub** - unique user ID from Cognito, used as userId in DynamoDB (not email)

### Files
```
cognito/
├── setup-cognito.sh   # Creates User Pool and App Client
├── config.js          # Pool ID and Client ID configuration
├── signUp.js          # Register a new user
├── confirmSignUp.js   # Verify email with 6-digit code
├── signIn.js          # Sign in and get tokens
├── getUser.js         # Get user info using Access Token
├── resetPassword.js   # Forgot + confirm password reset
└── decodeToken.js     # Decode JWT to read payload
```

---

## Module 05 - Lambda (Serverless Functions) ✅

**Date:** 2026-04-08

### What was done
- Created and deployed 5 Lambda functions to AWS (Node.js 20.x runtime)
- Each function handles one API operation with proper error handling and CORS
- Functions extract userId from Cognito authorizer claims (with fallback to body for testing)
- All functions tested via AWS CLI `lambda invoke`

### Resources Created
| Function | Name | Purpose |
|----------|------|---------|
| CreateNote | `NoteStack-CreateNote-SDLC` | Create a new note in DynamoDB |
| GetNotes | `NoteStack-GetNotes-SDLC` | Query all notes for a user |
| UpdateNote | `NoteStack-UpdateNote-SDLC` | Update title and content of a note |
| DeleteNote | `NoteStack-DeleteNote-SDLC` | Delete a note, returns old item |
| GenerateUploadUrl | `NoteStack-GenerateUploadUrl-SDLC` | Generate S3 pre-signed URL for file upload |

### Key Concepts Covered
- **Handler** - entry point AWS calls (`index.handler`)
- **Event** - JSON input from API Gateway (body, headers, queryStringParameters)
- **Execution Role** - `NoteStack-Lambda-Role` gives access to DynamoDB + S3
- **Cold Start** - first invocation has ~200-500ms extra delay
- **Response format** - must return `{ statusCode, headers, body: JSON.stringify(...) }`

### Files
```
lambda/
├── deploy-lambdas.sh          # Deploys all 5 functions to AWS
├── CreateNote/index.js        # POST - create note
├── GetNotes/index.js          # GET - query user's notes
├── UpdateNote/index.js        # PUT - update note
├── DeleteNote/index.js        # DELETE - delete note
└── GenerateUploadUrl/index.js # POST - generate S3 upload URL
```

---

## Module 06 - API Gateway (REST APIs) ✅

**Date:** 2026-04-08

### What was done
- Created REST API `NoteStack-API-SDLC` with Regional endpoint
- Created `/notes` and `/notes/upload-url` resources
- Linked 5 HTTP methods to their Lambda functions (POST, GET, PUT, DELETE)
- Created Cognito Authorizer `NoteStack-CognitoAuth-SDLC` on all methods
- Enabled CORS with OPTIONS mock integration on both resources
- Deployed to `dev` stage
- Tested: 401 without token, 201 with valid token

### Resources Created
| Resource | Name | Details |
|----------|------|---------|
| REST API | `NoteStack-API-SDLC` | ID: `a1ebt6lln9` |
| Authorizer | `NoteStack-CognitoAuth-SDLC` | Cognito User Pool authorizer |
| Stage | `dev` | Deployment stage |

### API Endpoints
| Method | Path | Lambda |
|--------|------|--------|
| POST | /notes | NoteStack-CreateNote-SDLC |
| GET | /notes | NoteStack-GetNotes-SDLC |
| PUT | /notes | NoteStack-UpdateNote-SDLC |
| DELETE | /notes | NoteStack-DeleteNote-SDLC |
| POST | /notes/upload-url | NoteStack-GenerateUploadUrl-SDLC |

**Invoke URL:** `https://a1ebt6lln9.execute-api.ap-south-1.amazonaws.com/dev`

### Key Concepts Covered
- **REST API** - set of HTTP endpoints connected to Lambda via API Gateway
- **Resource** - URL path (`/notes`, `/notes/upload-url`)
- **Method** - HTTP verb on a resource (GET, POST, PUT, DELETE)
- **Integration** - connection between method and Lambda (AWS_PROXY)
- **Authorizer** - Cognito validates the Authorization header before Lambda runs
- **Stage** - deployment environment (`dev`, `prod`)
- **CORS** - browser security requiring explicit cross-origin permission

### Files
```
api-gateway/
├── setup-api-gateway.sh  # Creates API, resources, methods, authorizer, CORS, deploys
└── test-api.sh           # Tests all endpoints with Cognito auth
```

---

## Module 07 - Secrets Manager ✅

**Date:** 2026-04-08

### What was done
- Created secret `notestack/config-sdlc` with 3 key-value pairs
- Built and tested scripts to read and update secrets
- Update script preserves all existing keys (read-modify-write pattern)

### Resources Created
| Resource | Name | Keys |
|----------|------|------|
| Secret | `notestack/config-sdlc` | NOTIFICATION_API_KEY, APP_SECRET, ALLOWED_FILE_TYPES |

### Key Concepts Covered
- **Secret** - encrypted key-value data, retrieved at runtime via API
- **Secret Version** - AWS keeps old versions (AWSCURRENT, AWSPREVIOUS) for rollback
- **Auto Rotation** - auto-change secrets on a schedule for security
- **Caching** - cache secrets outside Lambda handler to survive warm starts
- **Read-modify-write** - always include ALL keys when updating, or others get deleted

### Files
```
secrets-manager/
├── setup-secret.sh    # Creates the secret with initial values
├── readSecret.js      # Read and display secret values
└── updateSecret.js    # Update a specific key (preserves others)
```

---

## Module 08 - CloudWatch (Monitoring & Logging) ✅

**Date:** 2026-04-08

### What was done
- Created SNS topic `NoteStack-Alerts-SDLC` for alarm notifications
- Created CloudWatch alarm `NoteStack-CreateNote-HighErrors-SDLC` (triggers when errors > 5 in 5 min)
- Created CloudWatch dashboard `NoteStack-Dashboard-SDLC` with 3 widgets (Invocations, Errors, Duration)
- Built scripts to view Lambda logs and publish custom metrics
- Tested custom metric publish and log retrieval

### Resources Created
| Resource | Name | Purpose |
|----------|------|---------|
| SNS Topic | `NoteStack-Alerts-SDLC` | Email notifications for alarms |
| Alarm | `NoteStack-CreateNote-HighErrors-SDLC` | Fires when CreateNote errors > 5 in 5 min |
| Dashboard | `NoteStack-Dashboard-SDLC` | Visual overview of all Lambda metrics |

### Key Concepts Covered
- **Logs** - every `console.log()` in Lambda goes to CloudWatch automatically
- **Log Group** - one per Lambda function, contains Log Streams
- **Metrics** - numerical measurements (Invocations, Duration, Errors, Throttles)
- **Alarms** - automated alerts when a metric crosses a threshold (OK, ALARM, INSUFFICIENT_DATA)
- **Dashboard** - visual board with graphs for all Lambda metrics
- **Custom Metrics** - publish app-specific metrics (e.g., notes created per hour)
- **REPORT line** - Lambda auto-logs duration, memory used, init duration (cold start indicator)

### Files
```
cloudwatch/
├── setup-cloudwatch.sh  # Creates SNS topic, alarm, and dashboard
├── viewLogs.js          # View recent Lambda logs
└── customMetric.js      # Publish custom metrics to CloudWatch
```

---

## Module 09 - React Frontend ✅

**Date:** 2026-04-08

### What was done
- Built React frontend with auth flow (Sign In, Sign Up, Verify Email)
- Notes dashboard with full CRUD (create, read, update, delete)
- File upload via S3 pre-signed URLs
- Cognito auth directly from browser using fetch API
- Token stored in localStorage, decoded for user info
- XSS prevention via HTML escaping in note rendering

### Features
| Feature | Description |
|---------|-------------|
| Sign Up | Register with email, password, name |
| Verify Email | Enter 6-digit code from email |
| Sign In | Authenticate and store JWT tokens |
| Create Note | Title + content + optional file attachment |
| View Notes | List all notes sorted by date |
| Edit Note | Update title and content |
| Delete Note | Remove with confirmation |
| File Upload | Pre-signed URL upload to S3 |
| Logout | Clear tokens from localStorage |

### Files
```
notestack-frontend/
├── public/index.html              # HTML entry point
├── src/
│   ├── index.js                   # React entry point
│   ├── App.js                     # Root component (auth routing)
│   ├── App.css                    # Global styles
│   ├── config.js                  # API URL and Cognito IDs
│   ├── api/
│   │   ├── auth.js                # Cognito auth functions
│   │   └── notes.js               # Notes API + S3 upload functions
│   └── components/
│       ├── Auth.js                # Login/Signup/Verify forms
│       ├── Auth.css               # Auth styles
│       ├── Notes.js               # Notes dashboard with CRUD
│       └── Notes.css              # Notes styles
└── package.json
```

---
