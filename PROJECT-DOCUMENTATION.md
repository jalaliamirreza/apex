# APEX/SYNCRO Project - Complete Documentation

## Project Overview

**SYNCRO** (formerly APEX) is an AI-Native Business Process Platform for Banks, featuring a SAP Fiori-style launchpad interface with form management capabilities.

**Repository:** https://github.com/jalaliamirreza/apex/

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│                    http://localhost:3000                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ LaunchpadPage│  │  FormPage   │  │  Admin Pages (TBD)  │  │
│  │  (SAP Fiori) │  │  (SurveyJS) │  │  Spaces/Pages/etc   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                 │
│                    http://localhost:3001                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Launchpad  │  │    Forms    │  │   Admin (Phase 11)  │  │
│  │   Service   │  │   Service   │  │      Service        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────────┐   │
│  │ PostgreSQL│  │ Keycloak │  │ MinIO  │  │ OpenSearch   │   │
│  │   :5432   │  │  :8080   │  │ :9000  │  │    :9200     │   │
│  └──────────┘  └──────────┘  └────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| UI Components | UI5 Web Components for React |
| Forms | SurveyJS |
| Styling | Tailwind CSS, Vazirmatn font (Persian) |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 15 |
| Auth | Keycloak (configured, not fully integrated) |
| Storage | MinIO (S3-compatible) |
| Search | OpenSearch |
| Container | Docker Compose |

---

## Directory Structure

```
apex/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts         # PostgreSQL connection
│   │   ├── models/
│   │   │   ├── form.model.ts       # Form types
│   │   │   └── launchpad.model.ts  # Space, Page, Section, Tile types
│   │   ├── routes/
│   │   │   ├── index.ts            # Route registration
│   │   │   ├── form.routes.ts      # /api/v1/forms
│   │   │   ├── launchpad.routes.ts # /api/v1/launchpad
│   │   │   ├── search.routes.ts    # /api/v1/search
│   │   │   └── submission.routes.ts
│   │   ├── services/
│   │   │   ├── form.service.ts
│   │   │   └── launchpad.service.ts # Spaces, pages, sections, tiles queries
│   │   ├── utils/
│   │   │   └── logger.ts
│   │   └── index.ts                # Express app entry
│   ├── migrations/
│   │   ├── 001_add_direction_column.sql
│   │   ├── 002_add_launchpad_schema.sql  # Spaces, pages, sections
│   │   ├── 003_add_admin_app.sql         # Tiles table + admin data
│   │   ├── 003_create_tiles_table.sql
│   │   ├── 004_add_slugs.sql
│   │   ├── 004_fix_schema_slugs.sql
│   │   └── 005_complete_fix.sql
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── LaunchpadPage.tsx   # Main SAP Fiori launchpad
│   │   │   ├── FormPage.tsx        # SurveyJS form renderer
│   │   │   ├── AdminAppPage.tsx    # Placeholder for admin apps
│   │   │   ├── SearchPage.tsx
│   │   │   └── SubmissionsPage.tsx
│   │   ├── services/
│   │   │   └── api.ts              # Axios API client
│   │   ├── types/
│   │   │   └── launchpad.ts        # Frontend types
│   │   ├── App.tsx                 # React Router routes
│   │   └── main.tsx
│   ├── public/
│   │   └── logo.svg                # SYNCRO logo
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── keycloak/                       # Keycloak realm config
├── mcp-server/                     # MCP server for AI integration
├── docker-compose.yml
├── .env
└── [Documentation files]
```

---

## Database Schema

### Tables

```sql
-- SPACES (top-level navigation tabs)
spaces (
  id UUID PRIMARY KEY,
  name VARCHAR(255),           -- English name
  name_fa VARCHAR(255),        -- Persian name
  slug VARCHAR(100) UNIQUE,    -- URL slug
  icon VARCHAR(50),
  color VARCHAR(20),
  order_index INT,
  direction VARCHAR(3),        -- 'rtl' or 'ltr'
  is_active BOOLEAN
)

-- PAGES (dropdown items under spaces)
pages (
  id UUID PRIMARY KEY,
  space_id UUID REFERENCES spaces(id),
  name VARCHAR(255),
  name_fa VARCHAR(255),
  slug VARCHAR(100),
  icon VARCHAR(50),
  order_index INT,
  is_default BOOLEAN,
  is_active BOOLEAN
)

-- SECTIONS (groups of tiles on a page)
sections (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES pages(id),
  name VARCHAR(255),
  name_fa VARCHAR(255),
  order_index INT,
  is_active BOOLEAN
)

-- TILES (app tiles - type: form, app, link, kpi)
tiles (
  id UUID PRIMARY KEY,
  section_id UUID REFERENCES sections(id),
  name VARCHAR(255),
  name_fa VARCHAR(255),
  slug VARCHAR(255),
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  type VARCHAR(20),            -- 'form', 'app', 'link', 'kpi'
  order_index INT,
  direction VARCHAR(3),
  config JSONB,                -- {route: "/app/...", permissions: [...]}
  is_active BOOLEAN
)

-- FORMS (SurveyJS form definitions)
forms (
  id UUID PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  name_fa VARCHAR(255),
  description TEXT,
  schema JSONB,                -- SurveyJS JSON schema
  status VARCHAR(50),
  section_id UUID REFERENCES sections(id),
  icon VARCHAR(50),
  color VARCHAR(20),
  order_index INT,
  direction VARCHAR(3)
)

-- SUBMISSIONS (form submissions)
submissions (
  id UUID PRIMARY KEY,
  form_id UUID REFERENCES forms(id),
  data JSONB,
  submitted_by VARCHAR(255),
  created_at TIMESTAMP
)
```

### Current Data

**Spaces:**
| Slug | Name (EN) | Name (FA) | Icon |
|------|-----------|-----------|------|
| admin | Administration | مدیریت | settings |
| finance | Finance | مالی و اعتبارات | money-bills |
| hr | Human Resources | منابع انسانی | employee |
| it | Information Technology | فناوری اطلاعات | it-host |
| my-requests | My Requests | درخواست‌های من | outbox |

**Admin Tiles:**
| Slug | Name | Type | Route |
|------|------|------|-------|
| manage-spaces | مدیریت فضاها | app | /app/manage-spaces |
| manage-pages | مدیریت صفحات | app | /app/manage-pages |
| manage-sections | مدیریت بخش‌ها | app | /app/manage-sections |
| manage-tiles | مدیریت تایل‌ها | app | /app/manage-tiles |

---

## API Endpoints

### Launchpad API (`/api/v1/launchpad`)

```
GET /spaces                                    # All spaces with pages
GET /pages/:pageId                             # Page content by UUID
GET /pages/by-slug/:spaceSlug/:pageSlug/content # Page content by slugs
GET /spaces/:spaceSlug/default-page-slug       # Default page slug for space
```

### Forms API (`/api/v1/forms`)

```
GET    /forms                    # List all forms
GET    /forms/:slug              # Get form by slug
POST   /forms/:slug/submissions  # Submit form
GET    /forms/:slug/submissions  # Get submissions
```

### Admin API (`/api/v1/admin`) - TO BE IMPLEMENTED (Phase 11)

```
CRUD /spaces
CRUD /pages?spaceId=
CRUD /sections?pageId=
CRUD /tiles?sectionId=
```

---

## Frontend Routes

```tsx
/                              → Redirect to /launchpad
/launchpad                     → LaunchpadPage (default space/page)
/launchpad/:spaceSlug          → LaunchpadPage (default page of space)
/launchpad/:spaceSlug/:pageSlug → LaunchpadPage (specific page)
/forms/:slug                   → FormPage (SurveyJS form)
/forms/:slug/submissions       → SubmissionsPage
/app/:slug                     → AdminAppPage (placeholder) or specific admin pages
/search                        → SearchPage
```

---

## Running the Project

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Start All Services

```bash
cd D:\Worklab\SAP\AI\apex
docker-compose up -d
```

### Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:3001/api/v1 | - |
| PostgreSQL | localhost:5432 | apex/apex |
| Keycloak | http://localhost:8080 | admin/admin |
| MinIO | http://localhost:9001 | minioadmin/minioadmin |
| OpenSearch | http://localhost:9200 | - |

### Run Migrations

```bash
docker exec -i apex-postgres psql -U apex -d apex < backend/migrations/005_complete_fix.sql
```

### Check Database

```bash
docker exec apex-postgres psql -U apex -d apex -c "SELECT * FROM spaces;"
docker exec apex-postgres psql -U apex -d apex -c "SELECT * FROM tiles;"
```

### Rebuild Containers

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Key Files Reference

### Backend

| File | Purpose |
|------|---------|
| `backend/src/services/launchpad.service.ts` | Queries for spaces, pages, sections with UNION ALL for forms+tiles |
| `backend/src/routes/launchpad.routes.ts` | Launchpad REST endpoints with slug-based routing |
| `backend/src/models/launchpad.model.ts` | TypeScript interfaces for Space, Page, Section, Tile |

### Frontend

| File | Purpose |
|------|---------|
| `frontend/src/pages/LaunchpadPage.tsx` | Main SAP Fiori launchpad with shell bar, space tabs, tile grid |
| `frontend/src/services/api.ts` | Axios client with launchpadApi methods |
| `frontend/src/types/launchpad.ts` | Frontend TypeScript types |
| `frontend/src/App.tsx` | React Router configuration |

---

## Naming Convention

| Layer | Convention | Example |
|-------|------------|---------|
| Database columns | snake_case | `name_fa`, `order_index`, `is_active` |
| TypeScript (backend models) | camelCase | `nameFa`, `orderIndex`, `isActive` |
| TypeScript (frontend from API) | snake_case | Matches database |
| URL slugs | kebab-case | `manage-spaces`, `my-requests` |

---

## Completed Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1-7 | Initial setup, Docker, backend, frontend core | ✅ Complete |
| 8 | SurveyJS forms, RTL support, Vazirmatn font | ✅ Complete |
| 9 | SAP Fiori Launchpad UI | ✅ Complete |
| 9.5 | UI fixes, icons, hover effects | ✅ Complete |
| 10 | Admin components, login page, slug migration | ✅ Complete |
| 10.1 | Schema fix - English names, Persian name_fa, slugs | ✅ Complete |
| 11 | Admin CRUD apps | 📋 Spec ready |

---

## Pending Work (Phase 11)

See `PHASE11-ADMIN-CRUD.md` for complete specification.

**Claude Code Prompt:**
```
Read PHASE11-ADMIN-CRUD.md and implement all parts in order:

1. Create backend/src/services/admin.service.ts - CRUD for spaces, pages, sections, tiles
2. Create backend/src/routes/admin.routes.ts - REST endpoints
3. Register admin routes in backend/src/routes/index.ts
4. Create frontend/src/services/adminApi.ts - API client
5. Create frontend/src/components/AdminLayout.tsx - shared layout
6. Create frontend/src/pages/admin/ManageSpacesPage.tsx
7. Create frontend/src/pages/admin/ManagePagesPage.tsx
8. Create frontend/src/pages/admin/ManageSectionsPage.tsx
9. Create frontend/src/pages/admin/ManageTilesPage.tsx
10. Update frontend/src/App.tsx with new routes

Use existing code patterns from launchpad.service.ts and LaunchpadPage.tsx. Use UI5 web components. Test each API endpoint after creating backend.
```

---

## Future Work

- [ ] Keycloak authentication integration
- [ ] Login page with JWT
- [ ] Role-based access control for admin
- [ ] Form builder UI
- [ ] Workflow engine
- [ ] AI-powered form generation (MCP server)

---

## Troubleshooting

### Tiles not showing
1. Check backend service has UNION ALL query for forms + tiles
2. Verify `name_fa` column exists on forms table
3. Run migration 005_complete_fix.sql
4. Restart backend container

### Database connection issues
```bash
docker exec apex-postgres psql -U apex -d apex -c "SELECT 1;"
```

### Frontend not updating
```bash
docker-compose restart apex-frontend
# Or hard refresh browser: Ctrl+Shift+R
```

### Check logs
```bash
docker logs apex-backend -f
docker logs apex-frontend -f
```

---

## Contact

Project managed by: PM/Architect (Claude)
Development by: Claude Code

Last updated: 2025-12-20
