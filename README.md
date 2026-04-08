# NoteStack

**A Serverless Student Notes & File Sharing Platform built on AWS**

NoteStack is a full-stack serverless application that allows students to sign up, create notes, attach files, and manage their content — all powered by AWS cloud services. Built as a hands-on learning project covering 9 AWS modules from IAM to a complete React frontend.

---

## Architecture

```
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │    (notestack)      │
                    └──────────┬──────────┘
                               │ HTTPS
                    ┌──────────▼──────────┐
                    │    API Gateway      │
                    │  (REST API + CORS)  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │ Cognito Authorizer  │
                    │(JWT Token Validation)│
                    └──────────┬──────────┘
                               │
        ┌──────────┬───────────┼───────────┬───────────┐
        │          │           │           │           │
        ▼          ▼           ▼           ▼           ▼
   ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌──────────┐
   │ Create  ││  Get    ││ Update  ││ Delete  ││ GenUpload│
   │  Note   ││  Notes  ││  Note   ││  Note   ││   URL    │
   │ Lambda  ││ Lambda  ││ Lambda  ││ Lambda  ││  Lambda  │
   └────┬────┘└────┬────┘└────┬────┘└────┬────┘└─────┬────┘
        │          │          │          │            │
        └─────┬────┘          │          └──────┬─────┘
              │               │                 │
              ▼               ▼                 ▼
   ┌─────────────────┐  ┌──────────┐  ┌──────────────┐
   │    DynamoDB     │  │ Secrets  │  │  S3 Bucket   │
   │(NoteStack-Notes)│  │ Manager  │  │(File Storage)│
   └────────┬────────┘  └──────────┘  └──────┬───────┘
            │                                │
            └───────────────┬────────────────┘
                            │
                   ┌────────▼────────┐
                   │   CloudWatch    │
                   │ (Logs & Alarms) │
                   └─────────────────┘
```

**Flow:** User opens React app → signs in via Cognito → gets JWT token → React sends API requests with token → API Gateway validates token via Cognito Authorizer → routes to the correct Lambda function → Lambda reads/writes DynamoDB or generates S3 pre-signed URLs → response returned to frontend.

---

## AWS Services Used

### 1. IAM (Identity and Access Management)
IAM is the **security system** of AWS. It controls **who** can access your account, **what** they can do, and **which** resources they can touch.

| Concept | Description |
|---------|-------------|
| **IAM User** | A person or application with its own credentials (username/password or Access Keys) |
| **IAM Group** | A collection of users sharing the same permissions — attach policies once, all members get access |
| **IAM Role** | A temporary identity used by AWS services (like Lambda) — no permanent credentials, auto-rotated |
| **IAM Policy** | A JSON document defining allowed/denied actions on specific resources |

**Golden Rule — Principle of Least Privilege:** Give only the minimum permissions needed. Nothing more.

**Resources created:**
- `notestack-intern` — IAM user with console access
- `NoteStack-Interns` — Group with S3 + DynamoDB read-only access
- `NoteStack-LambdaBasic` — Custom policy for CloudWatch Logs permissions
- `NoteStack-Lambda-Role` — Execution role for all Lambda functions (DynamoDB + S3 + Logs + Secrets Manager)

---

### 2. S3 (Simple Storage Service)
S3 is **cloud file storage** — like Google Drive for your application. It stores files (called **objects**) inside containers (called **buckets**).

| Concept | Description |
|---------|-------------|
| **Bucket** | Top-level container. Names must be **globally unique** across all AWS accounts |
| **Object** | A file stored in a bucket. Has a **Key** (path), **Value** (content), and **Metadata** |
| **Prefix** | S3 has no real folders — the `/` in key names simulates folder structure |
| **Pre-signed URL** | A temporary link with cryptographic signature for uploading/downloading without AWS credentials |
| **Bucket Policy** | JSON rules defining who can access the bucket (attached to the bucket itself) |

**Why pre-signed URLs?** Instead of making the bucket public (security risk) or routing all files through your server (bottleneck), pre-signed URLs let users upload/download directly to S3 — fast, secure, and scalable.

**Resource created:** `notestack-files-sdlc-2026` — S3 bucket in ap-south-1 with all public access blocked.

---

### 3. DynamoDB (NoSQL Database)
DynamoDB is a **serverless NoSQL database** — no server to manage, automatic scaling, millisecond response times, and pay-per-request pricing.

| Concept | Description |
|---------|-------------|
| **Table** | A collection of data. Only the primary key is defined at creation — everything else is flexible |
| **Item** | A single row. Must have the primary key attributes; others are optional. Max size: 400 KB |
| **Attribute** | A single field (name-value pair). Types: String, Number, Boolean, List, Map |
| **Partition Key** | Groups items for fast lookup. In NoteStack: `userId` |
| **Sort Key** | Orders items within a partition. In NoteStack: `noteId` |
| **GSI** | Global Secondary Index — query data using a different key than the primary key |

**Why DynamoDB over SQL?** No server setup, auto-scaling, pay only when used. Best for simple key-based lookups like "get all notes for this user." Use SQL when you need complex joins across tables.

**Table design:**
| userId (Partition Key) | noteId (Sort Key) | title | content | createdAt |
|------------------------|-------------------|-------|---------|-----------|
| user-123 | note-001 | Lecture Notes | Today we learned... | 2026-04-01T10:00:00Z |
| user-123 | note-002 | Homework | Questions: 1... | 2026-04-01T14:00:00Z |

**Resource created:** `NoteStack-Notes-SDLC` — On-Demand capacity, ap-south-1.

---

### 4. Cognito (User Authentication)
Cognito is a **managed authentication service** — it handles sign-up, login, email verification, password reset, and token management. Never build auth from scratch.

| Concept | Description |
|---------|-------------|
| **User Pool** | A complete user directory storing usernames, passwords (encrypted), emails, and attributes |
| **App Client** | Configuration representing your app. Each gets a unique **Client ID** sent with every auth request |
| **ID Token** | Contains user info (name, email, sub). Send this in the API `Authorization` header |
| **Access Token** | Proves user is authenticated. Used for getting user profile info |
| **Refresh Token** | Gets new ID/Access tokens when they expire (every 1 hour). Lasts 30 days |
| **sub** | The unique user ID from Cognito — use this as `userId` in DynamoDB (not email, because email can change) |

**Authentication flow:**
```
User sends email + password
  → Cognito verifies credentials
    → Returns 3 tokens (ID, Access, Refresh)
      → App uses ID Token for future API calls
```

**Why tokens expire?** If stolen, they're useless after 1 hour. Refresh Token silently renews without re-login.

**Resources created:**
- `NoteStack-Users-SDLC` — User Pool (ID: `ap-south-1_MLQ6Ufbxy`)
- `NoteStack-WebApp-SDLC` — App Client (no client secret, for frontend use)

---

### 5. Lambda (Serverless Functions)
Lambda lets you **run code without managing servers**. You upload your function, AWS runs it only when triggered, and you pay only for execution time.

| Concept | Description |
|---------|-------------|
| **Function** | A self-contained piece of code doing one job (e.g., create note, delete note) |
| **Handler** | The entry point AWS calls. Format: `fileName.functionName` (e.g., `index.handler`) |
| **Event** | JSON input your function receives. From API Gateway: includes httpMethod, headers, body |
| **Context** | Metadata about execution: time remaining, function name, memory limit |
| **Trigger** | What causes Lambda to run: API Gateway (HTTP), S3 (file upload), CloudWatch (scheduled) |
| **Execution Role** | The IAM Role giving Lambda permission to access other services |
| **Cold Start** | First invocation has ~200-500ms extra delay (AWS sets up the container). Subsequent calls reuse it |

**Response format for API Gateway:**
```json
{
  "statusCode": 200,
  "headers": { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  "body": "{\"message\": \"success\"}"
}
```

> **Important:** `body` MUST be a string. Forgetting `JSON.stringify` is the #1 beginner mistake.

**Functions deployed:**
| Function | Name | Purpose |
|----------|------|---------|
| CreateNote | `NoteStack-CreateNote-SDLC` | POST — create a new note in DynamoDB |
| GetNotes | `NoteStack-GetNotes-SDLC` | GET — query all notes for a user |
| UpdateNote | `NoteStack-UpdateNote-SDLC` | PUT — update title and content |
| DeleteNote | `NoteStack-DeleteNote-SDLC` | DELETE — remove a note |
| GenerateUploadUrl | `NoteStack-GenerateUploadUrl-SDLC` | POST — generate S3 pre-signed URL for file upload |

---

### 6. API Gateway (REST APIs)
API Gateway is the **public front door** of your application. Your browser can't call Lambda directly (it's in AWS's private network). API Gateway provides a public URL, receives HTTP requests, checks authentication, and routes them to the right Lambda function.

| Concept | Description |
|---------|-------------|
| **REST API** | A set of endpoints using HTTP methods (GET, POST, PUT, DELETE) |
| **Resource** | A URL path in your API (`/notes`, `/notes/upload-url`) |
| **Method** | HTTP action on a resource: GET (read), POST (create), PUT (update), DELETE (remove) |
| **Integration** | The connection between a method and its Lambda function (AWS_PROXY mode) |
| **Stage** | A deployment environment (`dev`, `prod`). Each stage gets its own URL |
| **Authorizer** | Security check before Lambda runs. Cognito Authorizer validates the JWT token from the `Authorization` header |
| **CORS** | Browser security that blocks requests to different domains. Must be explicitly enabled so your frontend can call the API |

**API endpoints:**
| Method | Path | Lambda | Description |
|--------|------|--------|-------------|
| POST | `/notes` | CreateNote | Create a new note |
| GET | `/notes` | GetNotes | Get all notes for authenticated user |
| PUT | `/notes` | UpdateNote | Update an existing note |
| DELETE | `/notes` | DeleteNote | Delete a note |
| POST | `/notes/upload-url` | GenerateUploadUrl | Get pre-signed URL for file upload |

**Base URL:** `https://a1ebt6lln9.execute-api.ap-south-1.amazonaws.com/dev`

> **Common mistake:** Making changes in API Gateway and wondering why they don't work — you forgot to **re-deploy**!

---

### 7. Secrets Manager
Secrets Manager is a **secure vault** for your application's sensitive data — API keys, database passwords, third-party tokens. It encrypts data at rest, controls access via IAM, and can auto-rotate secrets on a schedule.

| Concept | Description |
|---------|-------------|
| **Secret** | A named piece of sensitive data stored encrypted. Retrieved at runtime via API — never in source code |
| **Secret Value** | The actual data. Returned as `result.SecretString` (raw string). If JSON, must `JSON.parse()` it |
| **Secret Version** | AWS keeps old versions when you update. Labels: `AWSCURRENT` (latest), `AWSPREVIOUS` (before) |
| **Auto Rotation** | Auto-changes secrets on a schedule (e.g., every 30 days). If stolen, it becomes useless after rotation |
| **Caching** | Cache secrets outside the Lambda handler (`let cachedSecrets = null`) so they survive warm starts |

**When to use what:**
| Data | Where to store |
|------|---------------|
| API keys, passwords, tokens | Secrets Manager |
| Region, table names, stage | Lambda environment variables |
| Constants, app logic | Code |

**Resource created:** `notestack/config-sdlc` — stores NOTIFICATION_API_KEY, APP_SECRET, ALLOWED_FILE_TYPES.

---

### 8. CloudWatch (Monitoring & Logging)
CloudWatch is the **monitoring and observability system** for your AWS services. Every `console.log()` in Lambda goes to CloudWatch Logs automatically. It tracks metrics, sends alarm notifications, and provides dashboards.

| Concept | Description |
|---------|-------------|
| **Logs** | Text records from your app. Structure: Log Group (one per Lambda) → Log Stream → Log Event |
| **Metrics** | Numerical measurements over time. Lambda auto-publishes: Invocations, Duration, Errors, Throttles |
| **Alarms** | Automated alerts when a metric crosses a threshold. States: OK, ALARM, INSUFFICIENT_DATA |
| **Dashboard** | Visual board with graphs showing all your Lambda metrics on one screen |
| **Log Insights** | Query language to search logs. Example: `fields @timestamp, @message | filter @message like /ERROR/` |
| **Custom Metrics** | App-specific metrics you publish (e.g., "notes created per hour") |
| **REPORT line** | Auto-logged by Lambda: Duration, Billed Duration, Memory Used, Init Duration (cold start indicator) |

**Resources created:**
- `NoteStack-Alerts-SDLC` — SNS topic for email notifications
- `NoteStack-CreateNote-HighErrors-SDLC` — Alarm when CreateNote errors > 5 in 5 minutes
- `NoteStack-Dashboard-SDLC` — Dashboard with Invocations, Errors, and Duration widgets

---

## Project Structure

```
NoteStack/
│
├── iam/                              # Module 01 — IAM
│   ├── setup-iam.sh                  # Creates user, group, policy, Lambda role
│   ├── cleanup-iam.sh                # Tears down all IAM resources
│   ├── trust-policy.json             # Lambda assume-role trust policy
│   └── notestack-lambda-basic-policy.json  # CloudWatch Logs permissions
│
├── s3/                               # Module 02 — S3
│   ├── setup-s3.sh                   # Creates bucket and folder structure
│   ├── upload.js                     # Upload a local file to S3
│   ├── download.js                   # Download and display a file from S3
│   ├── list.js                       # List files under a prefix
│   └── presigned-url.js              # Generate a temporary pre-signed URL
│
├── dynamodb/                         # Module 03 — DynamoDB
│   ├── setup-dynamodb.sh             # Creates the DynamoDB table
│   ├── putItem.js                    # Create a note
│   ├── getItem.js                    # Read one note
│   ├── query.js                      # Read all notes for a user
│   ├── updateItem.js                 # Update a note
│   └── deleteItem.js                 # Delete a note
│
├── cognito/                          # Module 04 — Cognito
│   ├── setup-cognito.sh              # Creates User Pool and App Client
│   ├── config.js                     # Pool ID and Client ID
│   ├── signUp.js                     # Register a new user
│   ├── confirmSignUp.js              # Verify email with code
│   ├── signIn.js                     # Sign in and get tokens
│   ├── getUser.js                    # Get user info
│   ├── resetPassword.js              # Forgot + reset password
│   └── decodeToken.js                # Decode JWT payload
│
├── lambda/                           # Module 05 — Lambda
│   ├── deploy-lambdas.sh             # Deploys all 5 functions
│   ├── CreateNote/index.js           # POST — create note
│   ├── GetNotes/index.js             # GET — query notes
│   ├── UpdateNote/index.js           # PUT — update note
│   ├── DeleteNote/index.js           # DELETE — delete note
│   └── GenerateUploadUrl/index.js    # POST — S3 upload URL
│
├── api-gateway/                      # Module 06 — API Gateway
│   ├── setup-api-gateway.sh          # Creates API, routes, authorizer, CORS, deploys
│   └── test-api.sh                   # Tests endpoints with auth
│
├── secrets-manager/                  # Module 07 — Secrets Manager
│   ├── setup-secret.sh               # Creates the secret
│   ├── readSecret.js                 # Read secret values
│   └── updateSecret.js               # Update a secret key
│
├── cloudwatch/                       # Module 08 — CloudWatch
│   ├── setup-cloudwatch.sh           # Creates SNS topic, alarm, dashboard
│   ├── viewLogs.js                   # View Lambda logs
│   └── customMetric.js               # Publish custom metrics
│
├── notestack-frontend/               # Module 09 — React Frontend
│   ├── public/index.html
│   └── src/
│       ├── index.js                  # React entry point
│       ├── App.js                    # Root component
│       ├── App.css                   # Global styles (dark glassmorphism theme)
│       ├── config.js                 # API URL and Cognito configuration
│       ├── api/
│       │   ├── auth.js               # Cognito auth (signUp, signIn, signOut)
│       │   └── notes.js              # Notes API + S3 upload functions
│       └── components/
│           ├── Auth.js               # Login / Sign Up / Verify forms
│           ├── Auth.css
│           ├── Notes.js              # Notes dashboard with CRUD
│           └── Notes.css
│
├── DEVELOPMENT_LOG.md                # Milestone tracking document
├── package.json                      # Root package (AWS SDK dependencies)
└── .gitignore
```

---

## Prerequisites

- **AWS Free Tier account** with programmatic access configured
- **Node.js** v18+ installed
- **AWS CLI** v2 installed and configured (`aws configure` with access key, secret key, region `ap-south-1`)

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Harishankar00/SDLC-Testing.git
cd SDLC-Testing
```

### 2. Install dependencies
```bash
npm install
cd notestack-frontend && npm install && cd ..
```

### 3. Deploy AWS resources (in order)
```bash
bash iam/setup-iam.sh
bash s3/setup-s3.sh
bash dynamodb/setup-dynamodb.sh
bash cognito/setup-cognito.sh
bash lambda/deploy-lambdas.sh
bash api-gateway/setup-api-gateway.sh
bash secrets-manager/setup-secret.sh
bash cloudwatch/setup-cloudwatch.sh
```

> After running `setup-cognito.sh`, update `cognito/config.js` and `notestack-frontend/src/config.js` with the Pool ID and Client ID.

> After running `setup-api-gateway.sh`, update `notestack-frontend/src/config.js` with the Invoke URL.

### 4. Run the frontend
```bash
cd notestack-frontend
npm start
```

The app opens at `http://localhost:3000`.

---

## Usage

1. **Sign Up** — Enter your name, email, and password (8+ chars, uppercase, lowercase, number, symbol)
2. **Verify Email** — Enter the 6-digit code sent to your email
3. **Sign In** — Log in with your email and password
4. **Create Notes** — Add a title, content, and optionally attach a file
5. **Manage Notes** — Edit or delete your notes
6. **Logout** — Clears tokens from localStorage

---

## AWS Resources Summary

| Service | Resource Name | Region |
|---------|--------------|--------|
| IAM Role | `NoteStack-Lambda-Role` | Global |
| S3 Bucket | `notestack-files-sdlc-2026` | ap-south-1 |
| DynamoDB Table | `NoteStack-Notes-SDLC` | ap-south-1 |
| Cognito User Pool | `NoteStack-Users-SDLC` | ap-south-1 |
| Lambda (x5) | `NoteStack-*-SDLC` | ap-south-1 |
| API Gateway | `NoteStack-API-SDLC` | ap-south-1 |
| Secret | `notestack/config-sdlc` | ap-south-1 |
| CloudWatch Dashboard | `NoteStack-Dashboard-SDLC` | ap-south-1 |
| CloudWatch Alarm | `NoteStack-CreateNote-HighErrors-SDLC` | ap-south-1 |
| SNS Topic | `NoteStack-Alerts-SDLC` | ap-south-1 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, CSS3 (glassmorphism + animations) |
| API Layer | AWS API Gateway (REST, Regional) |
| Authentication | AWS Cognito (User Pool + JWT tokens) |
| Backend | AWS Lambda (Node.js 20.x) |
| Database | AWS DynamoDB (NoSQL, On-Demand) |
| File Storage | AWS S3 (pre-signed URLs) |
| Secrets | AWS Secrets Manager |
| Monitoring | AWS CloudWatch (Logs, Alarms, Dashboards) |
| Permissions | AWS IAM (Roles, Policies, Groups) |

---

## Key Technical Decisions

| Decision | Why |
|----------|-----|
| DynamoDB over SQL | No server setup, auto-scaling, ideal for key-based lookups ("get all notes for user X") |
| Cognito `sub` as userId | Email can change; `sub` is immutable and unique |
| Pre-signed URLs for uploads | Browser uploads directly to S3 — no server bottleneck, secure without making bucket public |
| On-Demand DynamoDB | Pay per request — best for learning and unpredictable traffic |
| No client secret on App Client | Browser/frontend code can't keep secrets; Cognito supports public clients |
| CORS on both API Gateway and S3 | Browser enforces same-origin policy; both services need explicit cross-origin headers |
| Secrets cached outside handler | Avoids re-fetching on every warm Lambda invocation — reduces latency and API calls |

---

## Development Log

See [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md) for detailed milestone tracking across all 9 modules.

---

## Author

**Harishankar** — Built as a serverless AWS learning project following the NoteStack reference guide by Neurostack.
