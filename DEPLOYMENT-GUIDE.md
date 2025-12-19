# APEX Deployment Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Ports available: 3000, 3001, 5432, 8080, 9000, 9001, 9200

### Step 1: Start All Services

```bash
cd /home/user/apex
docker compose up -d
```

This will start all 7 services:
- PostgreSQL (port 5432)
- OpenSearch (port 9200)
- Keycloak (port 8080)
- MinIO (ports 9000, 9001)
- Backend API (port 3001)
- Frontend (port 3000)
- MCP Server (port 3002)

### Step 2: Wait for Services to Initialize

```bash
# Check service status
docker compose ps

# Wait for all services to be healthy (30-60 seconds)
# You should see "healthy" or "running" for all services
```

### Step 3: Verify Services

```bash
# Test backend health
curl http://localhost:3001/health
# Expected: {"status":"ok"}

# Test database
docker compose exec postgres pg_isready -U apex -d apex
# Expected: apex/apex:5432 - accepting connections

# Test OpenSearch
curl http://localhost:9200/_cluster/health
# Expected: {"cluster_name":"docker-cluster","status":"green"...}

# Test frontend (in browser)
# Open: http://localhost:3000
```

### Step 4: View Logs (if needed)

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

## Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | N/A |
| **Backend API** | http://localhost:3001/api/v1 | API Key: apex-internal-key-change-me |
| **Keycloak Admin** | http://localhost:8080 | admin / admin_change_me |
| **MinIO Console** | http://localhost:9001 | apex / apex_secret_change_me |
| **OpenSearch** | http://localhost:9200 | No auth (dev mode) |

## Testing the Application

### 1. Create a Form via API

```bash
curl -X POST http://localhost:3001/api/v1/forms \
  -H "Content-Type: application/json" \
  -H "X-API-Key: apex-internal-key-change-me" \
  -d '{
    "name": "Equipment Request",
    "description": "Request IT equipment",
    "fields": [
      {"name": "employee_name", "type": "text", "label": "Employee Name", "required": true},
      {"name": "department", "type": "select", "label": "Department", "options": ["IT", "HR", "Finance"]},
      {"name": "equipment", "type": "text", "label": "Equipment Type", "required": true},
      {"name": "justification", "type": "textarea", "label": "Justification"}
    ]
  }'
```

Response:
```json
{
  "id": "uuid",
  "slug": "equipment-request",
  "name": "Equipment Request",
  "url": "/forms/equipment-request",
  "schema": {...}
}
```

### 2. View Forms in Frontend

Open: http://localhost:3000/forms

You should see the "Equipment Request" form.

### 3. Fill and Submit Form

1. Click "Fill Form →" on the Equipment Request card
2. Fill in the fields
3. Submit
4. You'll be redirected to the submissions page

### 4. Search Submissions

1. Go to http://localhost:3000/search
2. Search for "laptop" or any keyword
3. Results will appear with highlights

## MCP Server Integration (Claude Desktop)

### Configure Claude Desktop

Add to your Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "apex": {
      "command": "docker",
      "args": ["compose", "exec", "mcp-server", "npm", "start"],
      "env": {
        "APEX_API_URL": "http://backend:3001/api/v1",
        "APEX_API_KEY": "apex-internal-key-change-me"
      }
    }
  }
}
```

### Use Claude to Create Forms

```
User: "Create a form for asset delivery confirmation with fields for
asset ID, description, receiving clerk, date, and signature"

Claude: *uses create_form tool*

Response: "✓ Form 'Asset Delivery Confirmation' created!
- Slug: asset-delivery-confirmation
- URL: http://localhost:3000/forms/asset-delivery-confirmation
- Fields: 5
Form is live and ready."
```

## Troubleshooting

### Service won't start

```bash
# Check logs
docker compose logs <service-name>

# Restart service
docker compose restart <service-name>

# Rebuild and restart
docker compose up -d --build <service-name>
```

### Database connection issues

```bash
# Check PostgreSQL is ready
docker compose exec postgres pg_isready -U apex -d apex

# View database logs
docker compose logs postgres

# Connect to database manually
docker compose exec postgres psql -U apex -d apex
```

### OpenSearch not healthy

```bash
# Check cluster health
curl http://localhost:9200/_cluster/health

# View logs
docker compose logs opensearch

# OpenSearch takes 30-60 seconds to start - be patient!
```

### Backend can't connect to services

```bash
# Check all services are on the same network
docker network ls
docker network inspect apex_apex-network

# Verify environment variables
docker compose exec backend env | grep -E "DATABASE_URL|OPENSEARCH_URL"
```

### Frontend shows errors

```bash
# Check backend is running
curl http://localhost:3001/health

# Check CORS settings
docker compose logs backend | grep CORS

# Verify frontend environment
docker compose exec frontend env | grep VITE_
```

## Stopping Services

```bash
# Stop all services (keep data)
docker compose down

# Stop and remove all data
docker compose down -v

# Stop specific service
docker compose stop backend
```

## Database Access

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U apex -d apex

# View forms
SELECT id, slug, name, status FROM forms;

# View submissions
SELECT id, form_id, submitted_at FROM submissions;

# Exit
\q
```

## Environment Variables

Located in `.env` file:

```env
POSTGRES_PASSWORD=apex_secret_change_me
KEYCLOAK_PASSWORD=admin_change_me
MINIO_USER=apex
MINIO_PASSWORD=apex_secret_change_me
APEX_API_KEY=apex-internal-key-change-me
```

**⚠️ Change these before production deployment!**

## Success Checklist

- [ ] All containers are running: `docker compose ps`
- [ ] Backend health check passes: `curl http://localhost:3001/health`
- [ ] Frontend loads: http://localhost:3000
- [ ] Can create form via API
- [ ] Form appears in frontend
- [ ] Can submit form
- [ ] Submission appears in list
- [ ] Search returns results
- [ ] MCP tools work with Claude Desktop

## Next Steps

1. **Configure Keycloak** for real authentication
2. **Set up HTTPS** with reverse proxy (nginx/Traefik)
3. **Enable OpenSearch security**
4. **Configure file uploads** with MinIO
5. **Add custom forms** via MCP or API
6. **Deploy to production** (update docker-compose for production)

---

**Need Help?**
- Check logs: `docker compose logs -f`
- Restart services: `docker compose restart`
- Reset everything: `docker compose down -v && docker compose up -d`
