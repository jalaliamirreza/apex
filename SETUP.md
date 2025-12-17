# APEX Project Setup Documentation

## Project Overview

**APEX (AI Process EXecution)** is an AI-native business process platform that allows users to describe forms in natural language, which Claude generates and deploys automatically. Submissions are stored in PostgreSQL and indexed in OpenSearch for powerful search capabilities.

## Current Implementation Status

✅ **Phase 1: Infrastructure Setup** - COMPLETED

✅ **Phase 2: Backend Implementation** - COMPLETED

✅ **Phase 3: Frontend Implementation** - COMPLETED

✅ **Phase 4: MCP Server Implementation** - COMPLETED

✅ **Phase 5: Testing & Verification** - COMPLETED
- All 7 Docker containers running
- API endpoints working
- Form creation via MCP working (English & Persian labels)
- Form submission working
- OpenSearch full-text search working
- Claude Desktop MCP integration working

✅ **Phase 6: Frontend Redesign (SAP Fiori)** - COMPLETED
- Redesigned all UI with SAP Fiori design system
- Implemented @ui5/webcomponents-react components
- ShellBar navigation, Card-based layouts, ObjectPage, Table
- See FRONTEND-REDESIGN.md for full spec

---

## Project Structure

```
apex/
├── docker-compose.yml          # Docker orchestration (7 services)
├── .env                        # Environment variables
├── FRONTEND-REDESIGN.md        # SAP Fiori redesign spec
│
├── backend/                    # Node.js + Express + TypeScript API
│   ├── Dockerfile
│   ├── init.sql               # PostgreSQL schema
│   └── src/                   # 17 TypeScript files
│
├── frontend/                   # React + Vite UI
│   ├── Dockerfile
│   └── src/                   # 21 files (being redesigned)
│
├── mcp-server/                # MCP server for Claude
│   ├── Dockerfile
│   └── src/                   # 8 TypeScript files
│
└── keycloak/
    └── realm-export.json      # Auth configuration
```

---

## Services

| Service | Port | Status |
|---------|------|--------|
| Frontend | 3000 | ✅ Running |
| Backend API | 3001 | ✅ Running |
| MCP Server | stdio | ✅ Connected |
| PostgreSQL | 5432 | ✅ Healthy |
| OpenSearch | 9200 | ✅ Healthy |
| Keycloak | 8080 | ✅ Running |
| MinIO | 9000/9001 | ✅ Running |

---

## Quick Start

### 1. Start Docker (in WSL)
```bash
sudo dockerd &
```

### 2. Start All Services
```bash
cd /mnt/d/Worklab/SAP/AI/apex
docker compose up -d
```

### 3. Verify
```bash
docker ps
curl http://localhost:3001/health
```

### 4. Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Keycloak: http://localhost:8080 (admin/admin)
- MinIO: http://localhost:9001 (apex/apex_secret)

---

## MCP Tools (Claude Integration)

| Tool | Description |
|------|-------------|
| `create_form` | Create forms from natural language |
| `list_forms` | List all active forms |
| `get_form` | Get form details by slug |
| `get_submissions` | Get form submissions |
| `search_submissions` | Full-text search |

### Claude Desktop Config
Location: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "apex": {
      "command": "wsl",
      "args": ["node", "/mnt/d/Worklab/SAP/AI/apex/mcp-server/dist/index.js"],
      "env": {
        "APEX_API_URL": "http://localhost:3001",
        "APEX_API_KEY": "apex-internal-key-2024"
      }
    }
  }
}
```

---

## API Endpoints

### Forms
```
POST   /api/v1/forms                    # Create form
GET    /api/v1/forms                    # List forms
GET    /api/v1/forms/:slug              # Get form
DELETE /api/v1/forms/:slug              # Archive form
```

### Submissions
```
POST   /api/v1/forms/:slug/submissions  # Submit form
GET    /api/v1/forms/:slug/submissions  # Get submissions
```

### Search
```
GET    /api/v1/search?q=query           # Search submissions
```

---

## Phase 6: Frontend Redesign & Polish

### Objective
Replace basic Tailwind UI with SAP Fiori Launchpad design using @ui5/webcomponents-react

### New Dependencies
```json
"@ui5/webcomponents": "^2.0.0",
"@ui5/webcomponents-react": "^2.0.0",
"@ui5/webcomponents-icons": "^2.0.0",
"@ui5/webcomponents-fiori": "^2.0.0"
```

### Components Implemented
- **ShellBar** - Navigation header with Help and Notifications icons
- **FioriTile** - Reusable 160x160px square tiles (custom component)
- **BusyIndicator** - Loading states
- **MessageStrip** - Error and info messages
- **FlexBox** - Responsive layouts
- **HTML Table** - Submissions display (native table for better compatibility)

### Key Features
✅ SAP Fiori Launchpad style with square tiles
✅ Icon at bottom, title/subtitle at top
✅ Section grouping ("Forms", "Available Forms")
✅ Hover effects with shadow elevation
✅ Proper click handlers on all tiles
✅ Help and Notifications icons in ShellBar
✅ All TypeScript errors fixed

### Files Updated
- `frontend/src/components/FioriTile.tsx` - NEW reusable tile component
- `frontend/src/pages/HomePage.tsx` - Fiori Launchpad style with section groups
- `frontend/src/pages/FormsListPage.tsx` - Square tiles for forms
- `frontend/src/pages/FormPage.tsx` - Simplified layout, removed unsupported components
- `frontend/src/pages/SubmissionsPage.tsx` - HTML table for submissions
- `frontend/src/pages/SearchPage.tsx` - Fixed BusyIndicator size
- `frontend/src/App.tsx` - Added Help and Notifications icons to ShellBar
- `frontend/src/vite-env.d.ts` - NEW TypeScript definitions for Vite

### After Changes
```bash
docker compose up -d --build apex-frontend
```

See **FRONTEND-REDESIGN.md** and **FIORI-POLISH.md** for full specs.

---

## Troubleshooting

### Docker not connecting
```bash
# Start Docker daemon in WSL
sudo dockerd &
```

### MCP not connecting
```bash
# Build MCP server
cd /mnt/d/Worklab/SAP/AI/apex/mcp-server
npm install && npm run build

# Restart Claude Desktop
```

### Check logs
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

---

## Git Repository

**URL:** https://github.com/jalaliamirreza/apex
**Branch:** claude/review-spec-docs-WKFjD

---

**Last Updated:** 2025-12-17
**Status:** Phase 6 (Frontend Redesign) COMPLETED - All features implemented
