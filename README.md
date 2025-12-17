# APEX MVP Documentation

**AI-Native Business Process Platform for Banks**

This documentation is split into 7 parts for Claude Code to build the MVP.

---

## Documentation Files

| File | Contents |
|------|----------|
| `01-OVERVIEW.md` | Project overview, architecture, tech stack, repository structure |
| `02-DOCKER-INFRA.md` | Docker Compose, environment variables, database schema, Keycloak config |
| `03-BACKEND-CORE.md` | Backend Dockerfile, package.json, config files, models, utilities |
| `04-BACKEND-SERVICES.md` | Backend services (form, submission, search) and routes |
| `05-FRONTEND-CORE.md` | Frontend setup, config, main components |
| `06-FRONTEND-PAGES-MCP.md` | Frontend pages and complete MCP server implementation |
| `07-IMPLEMENTATION-GUIDE.md` | Step-by-step build guide, commands, testing checklist |

---

## Quick Start

1. Read all 7 documentation files in order
2. Follow the implementation steps in `07-IMPLEMENTATION-GUIDE.md`
3. Test each component before moving to the next

---

## For Claude Code

**Command to give Claude Code:**

> "Read all files in the apex-docs folder. Build the APEX project following the implementation order in 07-IMPLEMENTATION-GUIDE.md. Test each step before proceeding to the next."

---

## The Vision

Bank IT describes what they need:

> "I need a form for asset delivery confirmation. Fields: asset ID, description, receiving clerk, date, signature."

Claude creates it instantly. Form is live. Submissions are stored and searchable.

**No weeks of IT tickets. No developers. Just conversation.**
