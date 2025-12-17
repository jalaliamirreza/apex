# APEX MVP — Part 1: Overview & Architecture

## Project Overview

**Project:** APEX (AI Process EXecution)  
**Goal:** Platform where users describe forms in natural language, Claude generates them, submissions are stored and searchable.

### Core Flow
```
User prompt → Claude generates form → Form is live → Users submit → Data searchable
```

### MVP Scope

| In Scope | Out of Scope |
|----------|--------------|
| AI generates form from prompt | Workflow/approvals |
| Form is deployed and fillable | PDF generation |
| Submissions stored | Email notifications |
| Basic search | Advanced permissions |
| Docker Compose deployment | Kubernetes |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude + MCP Server                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     APEX Backend (Node.js)                   │
│         /api/v1/forms, /submissions, /search, /files         │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬─────────────────┐
        ▼                 ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  PostgreSQL │   │ OpenSearch  │   │  Keycloak   │   │    MinIO    │
│  Port 5432  │   │  Port 9200  │   │  Port 8080  │   │  Port 9000  │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  APEX Frontend (React)                       │
│                      Port 3000                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Backend | Node.js + Express + TypeScript | Node 20 |
| Database | PostgreSQL | 15 |
| Search | OpenSearch | 2.11 |
| Auth | Keycloak | 23.x |
| Files | MinIO | Latest |
| Frontend | React + Formio.js + Tailwind | React 18 |
| MCP Server | @modelcontextprotocol/sdk | Latest |

---

## Repository Structure

```
apex/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── init.sql
│   └── src/
│       ├── index.ts
│       ├── config/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── middleware/
│       └── utils/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── App.tsx
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── types/
├── mcp-server/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.ts
│       └── tools/
└── keycloak/
    └── realm-export.json
```

---

## Success Criteria

- [ ] `docker-compose up` starts all services
- [ ] Claude can call `create_form` via MCP
- [ ] Form is accessible via frontend
- [ ] User can submit form
- [ ] Submission stored in Postgres
- [ ] Submission indexed in OpenSearch
- [ ] Search returns results
