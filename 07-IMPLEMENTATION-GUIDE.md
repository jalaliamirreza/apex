# APEX MVP — Part 7: Implementation Guide

## Implementation Order

Follow this exact sequence:

### Step 1: Project Setup (Day 1)
1. Create directory structure
2. Copy all config files (docker-compose.yml, .env, .gitignore)
3. Copy all package.json and tsconfig.json files
4. Create Dockerfiles
5. Create init.sql and realm-export.json
6. Test: `docker-compose up -d postgres opensearch minio keycloak`

### Step 2: Backend Core (Day 2-3)
1. Implement config files (database, opensearch, minio)
2. Implement utils (logger, slugify)
3. Implement models (form, submission)
4. Implement services (form, submission)
5. Implement middleware (auth, error)
6. Implement routes (form, submission)
7. Implement index.ts
8. Test: `docker-compose up -d backend` and test with curl

### Step 3: Search Integration (Day 4)
1. Implement search.service.ts
2. Implement search.routes.ts
3. Verify OpenSearch indexing
4. Test search endpoint

### Step 4: MCP Server (Day 5)
1. Implement apiClient
2. Implement all 5 tools
3. Implement index.ts
4. Test with Claude

### Step 5: Frontend (Day 6-7)
1. Create config files (vite, tailwind, postcss)
2. Implement types
3. Implement api service
4. Implement components
5. Implement pages
6. Implement App.tsx and main.tsx
7. Test: `docker-compose up -d frontend`

### Step 6: Integration Testing (Day 8)
1. Test full loop: Claude creates form → User fills → Search works
2. Fix bugs
3. Document

---

## Quick Start Commands

```bash
# Create project directory
mkdir apex && cd apex

# Create subdirectories
mkdir -p backend/src/{config,models,routes,services,middleware,utils}
mkdir -p frontend/src/{components,pages,services,types}
mkdir -p mcp-server/src/{tools,utils}
mkdir -p keycloak

# Copy all files from documentation parts 1-6

# Copy .env.example to .env
cp .env.example .env

# Start infrastructure
docker-compose up -d postgres opensearch minio keycloak

# Wait for services (check health)
docker-compose ps

# Start backend
docker-compose up -d backend

# Start frontend
docker-compose up -d frontend

# Start MCP server
docker-compose up -d mcp-server

# View logs
docker-compose logs -f backend

# Test health
curl http://localhost:3001/health

# Test create form
curl -X POST http://localhost:3001/api/v1/forms \
  -H "Content-Type: application/json" \
  -H "X-API-Key: apex-internal-key" \
  -d '{
    "name": "Test Form",
    "description": "A test form",
    "fields": [
      {"name": "name", "type": "text", "label": "Your Name", "required": true},
      {"name": "email", "type": "email", "label": "Email", "required": true}
    ]
  }'

# Open frontend
open http://localhost:3000

# Stop everything
docker-compose down

# Reset everything (including data)
docker-compose down -v
```

---

## Testing Checklist

### Infrastructure
- [ ] `docker-compose up -d` starts all containers
- [ ] PostgreSQL accessible on port 5432
- [ ] OpenSearch accessible on port 9200
- [ ] Keycloak accessible on port 8080
- [ ] MinIO accessible on port 9000/9001
- [ ] Backend accessible on port 3001
- [ ] Frontend accessible on port 3000

### Backend API
- [ ] GET /health returns 200
- [ ] POST /forms creates form
- [ ] GET /forms lists forms
- [ ] GET /forms/:slug returns form
- [ ] POST /forms/:slug/submissions creates submission
- [ ] GET /forms/:slug/submissions lists submissions
- [ ] GET /search?q=test returns results

### MCP Tools
- [ ] create_form creates form and returns URL
- [ ] list_forms shows all forms
- [ ] get_form shows form details
- [ ] get_submissions shows submissions
- [ ] search_submissions finds results

### Frontend
- [ ] Home page loads
- [ ] Forms list shows forms
- [ ] Form page renders correctly
- [ ] Form submission works
- [ ] Submissions page shows data
- [ ] Search page returns results

### End-to-End
- [ ] Claude creates form via MCP
- [ ] Form appears in frontend
- [ ] User fills and submits form
- [ ] Submission appears in list
- [ ] Submission is searchable

---

## API Reference

### Base URL
`http://localhost:3001/api/v1`

### Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/forms` | API Key | Create form |
| GET | `/forms` | Public | List forms |
| GET | `/forms/:slug` | Public | Get form |
| DELETE | `/forms/:slug` | API Key | Archive form |
| POST | `/forms/:slug/submissions` | Public | Submit form |
| GET | `/forms/:slug/submissions` | Public | List submissions |
| GET | `/search?q=query` | API Key | Search |
| POST | `/search` | API Key | Advanced search |
| GET | `/health` | Public | Health check |

### Authentication
- **API Key**: Header `X-API-Key: apex-internal-key`
- Used for: MCP server, admin operations

---

## MCP Tools Reference

### create_form
Creates a new form.

**Input:**
```json
{
  "name": "Equipment Request",
  "description": "Request IT equipment",
  "fields": [
    {"name": "employee", "type": "text", "label": "Employee Name", "required": true},
    {"name": "department", "type": "select", "label": "Department", "options": ["IT", "HR", "Finance"]},
    {"name": "equipment", "type": "text", "label": "Equipment Type", "required": true}
  ]
}
```

### list_forms
Lists all active forms. No input required.

### get_form
Gets form details.

**Input:**
```json
{"slug": "equipment-request"}
```

### get_submissions
Gets submissions for a form.

**Input:**
```json
{"formSlug": "equipment-request", "limit": 10}
```

### search_submissions
Searches across all submissions.

**Input:**
```json
{"query": "laptop", "formSlug": "equipment-request"}
```

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs <service-name>
docker-compose down -v  # Reset and try again
```

### OpenSearch health check fails
Wait longer - OpenSearch takes 30-60 seconds to start.

### Backend can't connect to database
Check DATABASE_URL in docker-compose.yml matches postgres service.

### Forms not showing in frontend
1. Check backend is running: `curl http://localhost:3001/health`
2. Check CORS is enabled
3. Check VITE_API_URL in frontend environment

### Search returns empty
1. Check OpenSearch is running: `curl http://localhost:9200/_cluster/health`
2. Verify submissions are being indexed (check backend logs)
3. Wait for index refresh

---

## Notes for Claude Code

1. **Follow implementation order** — Dependencies matter
2. **Test each step** — Don't accumulate bugs
3. **Keep it simple** — MVP means no over-engineering
4. **Log everything** — Debugging is easier with logs
5. **Handle errors** — Return useful messages

**Priority:** Get Claude → Form → Submit → Search loop working. Everything else is secondary.

---

**Document Complete. Hand these 7 files to Claude Code.**

**Command:** "Build this project. Follow the implementation order in Part 7. Test each step before moving on."
