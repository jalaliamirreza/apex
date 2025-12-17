# APEX Project Setup Documentation

## Project Overview

**APEX (AI Process EXecution)** is an AI-native business process platform that allows users to describe forms in natural language, which Claude generates and deploys automatically. Submissions are stored in PostgreSQL and indexed in OpenSearch for powerful search capabilities.

## Current Implementation Status

✅ **Phase 1: Infrastructure Setup** - COMPLETED

The foundation has been established with:
- Complete project folder structure
- Docker Compose orchestration
- Database schema
- Authentication configuration
- Environment variables

✅ **Phase 2: Backend Implementation** - COMPLETED

The backend API is fully implemented with:
- Express.js server with TypeScript
- PostgreSQL database integration
- OpenSearch full-text search
- MinIO object storage client
- RESTful API endpoints
- Authentication middleware
- Complete business logic services

## Project Structure

```
apex/
├── docker-compose.yml          # Docker orchestration for all services
├── .env                        # Environment variables (passwords, API keys)
│
├── backend/                    # Node.js + Express + TypeScript API
│   ├── init.sql               # PostgreSQL database schema
│   └── src/
│       ├── config/            # Database, OpenSearch, MinIO clients
│       ├── models/            # TypeScript interfaces for Forms & Submissions
│       ├── services/          # Business logic (form, submission, search)
│       ├── routes/            # API endpoints (/forms, /submissions, /search)
│       ├── middleware/        # Auth and error handling
│       └── utils/             # Logger, slugify utilities
│
├── frontend/                   # React + Vite + Tailwind UI
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/            # Route pages (HomePage, FormPage, etc.)
│       ├── services/         # API client
│       └── types/            # TypeScript interfaces
│
├── mcp-server/                # Model Context Protocol server for Claude
│   └── src/
│       ├── tools/            # MCP tools (create_form, list_forms, search, etc.)
│       └── utils/            # API client for backend
│
└── keycloak/                  # Authentication configuration
    └── realm-export.json      # Keycloak realm setup
```

## Services Architecture

### Infrastructure Services

| Service | Port | Description | Status |
|---------|------|-------------|--------|
| **PostgreSQL** | 5432 | Primary database for forms and submissions | ✅ Configured |
| **OpenSearch** | 9200 | Full-text search engine for submissions | ✅ Configured |
| **Keycloak** | 8080 | Authentication and user management | ✅ Configured |
| **MinIO** | 9000, 9001 | S3-compatible object storage for files | ✅ Configured |

### Application Services

| Service | Port | Description | Status |
|---------|------|-------------|--------|
| **Backend** | 3001 | REST API (Node.js + Express) | ✅ Implemented |
| **Frontend** | 3000 | React web application | 🔨 Pending |
| **MCP Server** | 3002 | Claude integration server | 🔨 Pending |

## Configuration Files

### 1. docker-compose.yml

**Location:** `/home/user/apex/docker-compose.yml`

**Purpose:** Orchestrates all 7 services with proper networking, health checks, and dependencies.

**Key Features:**
- Health checks for PostgreSQL and OpenSearch
- Service dependencies (backend waits for database)
- Shared network (`apex-network`)
- Persistent volumes for data
- Environment variable injection from `.env`

**Services Defined:**
```yaml
services:
  - postgres       # Database
  - opensearch     # Search engine
  - keycloak       # Authentication
  - minio          # File storage
  - backend        # API server
  - frontend       # Web UI
  - mcp-server     # Claude integration
```

### 2. .env

**Location:** `/home/user/apex/.env`

**Purpose:** Stores sensitive configuration and credentials.

**Variables:**
```env
POSTGRES_PASSWORD=apex_secret_change_me     # PostgreSQL database password
KEYCLOAK_PASSWORD=admin_change_me           # Keycloak admin password
MINIO_USER=apex                             # MinIO access key
MINIO_PASSWORD=apex_secret_change_me        # MinIO secret key
APEX_API_KEY=apex-internal-key-change-me    # Internal API key for MCP server
```

⚠️ **Security Note:** Change all default passwords before production deployment!

### 3. backend/init.sql

**Location:** `/home/user/apex/backend/init.sql`

**Purpose:** Initializes PostgreSQL database schema on first startup.

**Database Schema:**

#### Forms Table
Stores form definitions and metadata.

```sql
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,           -- URL-friendly identifier
    name VARCHAR(255) NOT NULL,                  -- Display name
    description TEXT,                            -- Form description
    schema JSONB NOT NULL,                       -- Formio.js schema
    status VARCHAR(50) DEFAULT 'active',         -- active | archived
    created_by VARCHAR(255),                     -- Username who created it
    created_at TIMESTAMP WITH TIME ZONE,         -- Creation timestamp
    updated_at TIMESTAMP WITH TIME ZONE          -- Last update timestamp
);
```

#### Submissions Table
Stores form submission data.

```sql
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL,                         -- Submission data
    files JSONB DEFAULT '[]',                    -- File attachments
    submitted_by VARCHAR(255),                   -- Username who submitted
    submitted_at TIMESTAMP WITH TIME ZONE        -- Submission timestamp
);
```

**Indexes:**
- `idx_forms_slug` - Fast lookup by slug
- `idx_forms_status` - Filter active/archived forms
- `idx_submissions_form_id` - Quick submission queries by form
- `idx_submissions_submitted_at` - Sort submissions by time

**Triggers:**
- Auto-updates `updated_at` column on form modifications

### 4. keycloak/realm-export.json

**Location:** `/home/user/apex/keycloak/realm-export.json`

**Purpose:** Pre-configures Keycloak authentication realm.

**Configuration:**

**Realm:** `apex`

**Clients:**
1. `apex-frontend` (Public client)
   - Redirect URIs: `http://localhost:3000/*`
   - CORS: `http://localhost:3000`
   - Used for browser-based authentication

2. `apex-backend` (Confidential client)
   - Secret: `apex-backend-secret`
   - Service account enabled
   - Used for server-to-server communication

**Roles:**
- `admin` - Administrator role
- `user` - Standard user role

**Pre-configured Users:**
| Username | Password | Email | Roles |
|----------|----------|-------|-------|
| admin | admin123 | admin@apex.local | admin, user |
| user | user123 | user@apex.local | user |

## Environment Variables Reference

### Backend Service Environment

```bash
NODE_ENV=development                                    # Runtime environment
PORT=3001                                              # API server port
DATABASE_URL=postgres://apex:password@postgres:5432/apex  # PostgreSQL connection
OPENSEARCH_URL=http://opensearch:9200                  # OpenSearch endpoint
KEYCLOAK_URL=http://keycloak:8080                      # Keycloak server
KEYCLOAK_REALM=apex                                    # Keycloak realm name
MINIO_ENDPOINT=minio                                   # MinIO hostname
MINIO_PORT=9000                                        # MinIO API port
MINIO_USE_SSL=false                                    # SSL disabled for local dev
MINIO_ACCESS_KEY=apex                                  # MinIO access key
MINIO_SECRET_KEY=apex_secret                           # MinIO secret key
APEX_API_KEY=apex-internal-key                         # Internal API authentication
```

### Frontend Service Environment

```bash
VITE_API_URL=http://localhost:3001/api/v1             # Backend API endpoint
VITE_KEYCLOAK_URL=http://localhost:8080                # Keycloak for browser
VITE_KEYCLOAK_REALM=apex                               # Realm name
VITE_KEYCLOAK_CLIENT_ID=apex-frontend                  # Client ID
```

### MCP Server Environment

```bash
APEX_API_URL=http://backend:3001/api/v1               # Backend API (internal network)
APEX_API_KEY=apex-internal-key                         # API authentication key
```

## Network Architecture

All services communicate via the `apex-network` Docker bridge network.

**Service Communication:**
```
┌─────────────────────────────────────────────────────────────┐
│  Claude Desktop (Host)                                       │
│    └─> MCP Server (3002)                                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  apex-network (Docker Bridge)                               │
│                                                              │
│  Backend (3001) ◄───► PostgreSQL (5432)                    │
│       │               OpenSearch (9200)                     │
│       │               MinIO (9000)                          │
│       │               Keycloak (8080)                       │
│       │                                                      │
│       ▼                                                      │
│  Frontend (3000) ────► Backend (3001)                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  User Browser (Host)                                         │
│    http://localhost:3000 (Frontend)                         │
│    http://localhost:8080 (Keycloak)                         │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Form Creation Flow
```
1. User describes form in Claude Desktop
2. Claude calls create_form via MCP Server
3. MCP Server POST to Backend API /forms
4. Backend saves to PostgreSQL
5. Returns form URL (e.g., /forms/equipment-request)
6. Form is immediately available in Frontend
```

### Form Submission Flow
```
1. User fills form in Frontend
2. Frontend POST to Backend API /forms/{slug}/submissions
3. Backend:
   - Saves to PostgreSQL (submissions table)
   - Indexes in OpenSearch (apex-submissions index)
4. Submission is searchable immediately
```

### Search Flow
```
1. User searches via Frontend or Claude
2. Frontend/MCP calls Backend API /search?q=query
3. Backend queries OpenSearch
4. Returns ranked results with highlights
```

## Volume Persistence

Docker volumes ensure data survives container restarts:

```yaml
volumes:
  postgres_data:     # PostgreSQL database files
  opensearch_data:   # OpenSearch indices
  minio_data:        # Uploaded files
```

**Data Location:** Docker manages these volumes automatically.

**Backup:** Use `docker-compose down` to stop services while preserving volumes.

**Reset:** Use `docker-compose down -v` to delete all data and start fresh.

## Health Checks

### PostgreSQL
```bash
pg_isready -U apex -d apex
# Checks every 5 seconds, 5 retries
```

### OpenSearch
```bash
curl -sf http://localhost:9200/_cluster/health
# Checks every 10 seconds, 10 retries
```

Other services depend on these health checks to ensure proper startup order.

## Quick Reference Commands

### Start All Services
```bash
docker-compose up -d
```

### Start Infrastructure Only
```bash
docker-compose up -d postgres opensearch minio keycloak
```

### View Logs
```bash
docker-compose logs -f backend     # Follow backend logs
docker-compose logs --tail=50      # Last 50 lines all services
```

### Check Service Status
```bash
docker-compose ps
```

### Stop All Services
```bash
docker-compose down
```

### Reset Everything (Delete Data)
```bash
docker-compose down -v
```

### Access Service Consoles

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | N/A |
| Backend API | http://localhost:3001 | X-API-Key header |
| Keycloak Admin | http://localhost:8080 | admin / admin_change_me |
| MinIO Console | http://localhost:9001 | apex / apex_secret_change_me |
| OpenSearch | http://localhost:9200 | No auth (dev mode) |

## Backend Implementation Details

### ✅ Phase 2: Backend Implementation (COMPLETED)

**All Files Created (17 files):**

1. **Backend Configuration (3 files)**
   - ✅ `backend/Dockerfile` - Container image definition
   - ✅ `backend/package.json` - Node.js dependencies (Express, TypeScript, PostgreSQL, OpenSearch, MinIO)
   - ✅ `backend/tsconfig.json` - TypeScript configuration

2. **Config Modules (3 files)**
   - ✅ `backend/src/config/database.ts` - PostgreSQL connection pool and query helper
   - ✅ `backend/src/config/opensearch.ts` - OpenSearch client and index initialization
   - ✅ `backend/src/config/minio.ts` - MinIO client and bucket setup

3. **Utilities (2 files)**
   - ✅ `backend/src/utils/logger.ts` - Winston logger with console output
   - ✅ `backend/src/utils/slugify.ts` - URL slug generator for form names

4. **Middleware (2 files)**
   - ✅ `backend/src/middleware/auth.middleware.ts` - API key authentication
   - ✅ `backend/src/middleware/error.middleware.ts` - Global error handler

5. **Models (2 files)**
   - ✅ `backend/src/models/form.model.ts` - Form interfaces and Formio.js conversion
   - ✅ `backend/src/models/submission.model.ts` - Submission interfaces

6. **Services (3 files)**
   - ✅ `backend/src/services/form.service.ts` - Form CRUD operations
   - ✅ `backend/src/services/submission.service.ts` - Submission creation and OpenSearch indexing
   - ✅ `backend/src/services/search.service.ts` - Full-text search with highlighting

7. **Routes (4 files)**
   - ✅ `backend/src/routes/index.ts` - Route aggregator
   - ✅ `backend/src/routes/form.routes.ts` - Form endpoints (POST, GET, DELETE)
   - ✅ `backend/src/routes/submission.routes.ts` - Submission endpoints
   - ✅ `backend/src/routes/search.routes.ts` - Search endpoints (GET, POST)

8. **Entry Point (1 file)**
   - ✅ `backend/src/index.ts` - Express server initialization and startup

**Key Features Implemented:**
- RESTful API with Express.js and TypeScript
- PostgreSQL integration with connection pooling
- OpenSearch full-text search with automatic indexing
- MinIO object storage client (ready for file uploads)
- API key authentication for internal services
- Comprehensive error handling and logging
- Form schema generation from simple field definitions
- Automatic URL slug generation
- Health check endpoint

## Next Implementation Steps

### 🔨 Phase 3: Frontend Implementation (Pending)

**Files to Create:**

1. **Frontend Configuration**
   - `frontend/Dockerfile` - Container image
   - `frontend/package.json` - React dependencies
   - `frontend/vite.config.ts` - Vite bundler config
   - `frontend/tsconfig.json` - TypeScript config
   - `frontend/tailwind.config.js` - Tailwind CSS
   - `frontend/postcss.config.js` - CSS processing
   - `frontend/index.html` - HTML entry point

2. **Frontend Source Code**
   - `frontend/src/main.tsx` - React entry point
   - `frontend/src/App.tsx` - Main app component
   - `frontend/src/index.css` - Global styles
   - `frontend/src/types/index.ts` - TypeScript types
   - `frontend/src/services/api.ts` - API client
   - `frontend/src/components/Navbar.tsx` - Navigation bar
   - `frontend/src/components/FormRenderer.tsx` - Formio.js renderer
   - `frontend/src/components/FormList.tsx` - Forms grid
   - `frontend/src/components/SubmissionList.tsx` - Submissions table
   - `frontend/src/components/SearchBar.tsx` - Search input
   - `frontend/src/pages/HomePage.tsx` - Landing page
   - `frontend/src/pages/FormsListPage.tsx` - Browse forms
   - `frontend/src/pages/FormPage.tsx` - Fill form
   - `frontend/src/pages/SubmissionsPage.tsx` - View submissions
   - `frontend/src/pages/SearchPage.tsx` - Search interface

### 🔨 Phase 4: MCP Server Implementation (Pending)

**Files to Create:**

1. **MCP Configuration**
   - `mcp-server/Dockerfile` - Container image
   - `mcp-server/package.json` - MCP SDK dependencies
   - `mcp-server/tsconfig.json` - TypeScript config

2. **MCP Source Code**
   - `mcp-server/src/index.ts` - MCP server entry point
   - `mcp-server/src/utils/apiClient.ts` - Backend API client
   - `mcp-server/src/tools/createForm.ts` - create_form tool
   - `mcp-server/src/tools/listForms.ts` - list_forms tool
   - `mcp-server/src/tools/getForm.ts` - get_form tool
   - `mcp-server/src/tools/getSubmissions.ts` - get_submissions tool
   - `mcp-server/src/tools/searchSubmissions.ts` - search_submissions tool

## Expected API Endpoints (After Backend Implementation)

### Forms API

```bash
# Create form (requires API key)
POST /api/v1/forms
Headers: X-API-Key: apex-internal-key
Body: {
  "name": "Equipment Request",
  "description": "Request IT equipment",
  "fields": [
    {"name": "employee", "type": "text", "label": "Employee Name", "required": true},
    {"name": "equipment", "type": "select", "label": "Equipment Type", "options": ["Laptop", "Monitor", "Phone"]}
  ]
}
Response: 201 Created
{
  "id": "uuid",
  "slug": "equipment-request",
  "name": "Equipment Request",
  "url": "/forms/equipment-request",
  "schema": {...}
}

# List all forms
GET /api/v1/forms
Response: 200 OK
{ "forms": [...] }

# Get form by slug
GET /api/v1/forms/equipment-request
Response: 200 OK
{ "id": "uuid", "slug": "equipment-request", "schema": {...} }

# Archive form (requires API key)
DELETE /api/v1/forms/equipment-request
Response: 200 OK
{ "message": "Form archived" }
```

### Submissions API

```bash
# Submit form
POST /api/v1/forms/equipment-request/submissions
Body: {
  "data": {
    "employee": "John Doe",
    "equipment": "laptop"
  }
}
Response: 201 Created
{ "id": "uuid", "formId": "uuid", "data": {...}, "submittedAt": "..." }

# Get submissions for form
GET /api/v1/forms/equipment-request/submissions?limit=50&offset=0
Response: 200 OK
{
  "submissions": [...],
  "total": 100
}
```

### Search API

```bash
# Search submissions (requires API key)
GET /api/v1/search?q=laptop
Response: 200 OK
{
  "results": [
    {
      "submissionId": "uuid",
      "formSlug": "equipment-request",
      "formName": "Equipment Request",
      "data": {...},
      "highlights": ["...laptop..."],
      "score": 4.5
    }
  ],
  "total": 5
}

# Advanced search (POST, requires API key)
POST /api/v1/search
Body: {
  "query": "laptop",
  "formSlug": "equipment-request",
  "limit": 20
}
```

## MCP Tools (After MCP Implementation)

### create_form
```
Creates a new form and returns the URL
Input: name, description, fields[]
Output: Form created with URL
```

### list_forms
```
Lists all active forms
Input: (none)
Output: List of forms with slugs
```

### get_form
```
Gets form details
Input: slug
Output: Form schema and metadata
```

### get_submissions
```
Gets submissions for a form
Input: formSlug, limit, offset
Output: List of submissions with data
```

### search_submissions
```
Searches across all submissions
Input: query, formSlug (optional), limit
Output: Ranked search results with highlights
```

## Testing Checklist

### Infrastructure Tests
- [ ] PostgreSQL starts and accepts connections
- [ ] OpenSearch cluster is healthy
- [ ] Keycloak imports realm successfully
- [ ] MinIO creates bucket automatically
- [ ] All health checks pass

### Integration Tests (After Implementation)
- [ ] Backend connects to all services
- [ ] API endpoints respond correctly
- [ ] Forms are saved to database
- [ ] Submissions are indexed in OpenSearch
- [ ] Search returns relevant results
- [ ] Frontend renders forms correctly
- [ ] Claude can create forms via MCP

## Troubleshooting

### Container won't start
```bash
docker-compose logs <service-name>
docker-compose down -v  # Reset and try again
```

### PostgreSQL connection failed
```bash
# Check health
docker-compose exec postgres pg_isready -U apex -d apex

# Connect manually
docker-compose exec postgres psql -U apex -d apex
```

### OpenSearch not ready
```bash
# Check cluster health
curl http://localhost:9200/_cluster/health

# Wait 30-60 seconds for OpenSearch to start
```

### Keycloak realm not imported
```bash
# Check logs
docker-compose logs keycloak

# Verify realm file exists
docker-compose exec keycloak ls /opt/keycloak/data/import/
```

## Security Considerations

### Before Production

⚠️ **Change all default passwords in `.env`:**
- PostgreSQL password
- Keycloak admin password
- MinIO credentials
- APEX API key

⚠️ **Enable HTTPS:**
- Use reverse proxy (nginx, Traefik)
- Obtain SSL certificates
- Update redirect URIs in Keycloak

⚠️ **Enable OpenSearch security:**
- Remove `plugins.security.disabled=true`
- Configure authentication
- Use TLS for transport

⚠️ **Environment Variables:**
- Don't commit `.env` to git
- Use secrets management in production
- Rotate API keys regularly

## Git Repository

**Branch:** `claude/review-spec-docs-WKFjD`

**Committed Files:**
- docker-compose.yml
- .env
- backend/init.sql
- keycloak/realm-export.json
- backend/ (complete implementation - 17 TypeScript files)
- Directory structure for frontend and mcp-server

**Not Committed:**
- Frontend source code (pending implementation)
- MCP server source code (pending implementation)
- node_modules/ (gitignored)
- Docker volumes (data)

## Support & Resources

**Documentation:**
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [OpenSearch Docs](https://opensearch.org/docs/latest/)
- [Keycloak Docs](https://www.keycloak.org/documentation)
- [MinIO Docs](https://min.io/docs/)
- [Formio.js Docs](https://help.form.io/)

**Project Specs:**
- See `01-OVERVIEW.md` through `07-IMPLEMENTATION-GUIDE.md` for complete specifications

---

**Last Updated:** 2025-12-17
**Status:** Phase 1-2 Complete (Infrastructure + Backend) | Phase 3-4 Pending (Frontend + MCP Server)
