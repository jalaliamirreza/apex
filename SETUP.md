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

## SurveyJS Form Renderer (Phase 8)

### Objective
Replace Form.io and custom renderers with SurveyJS for better RTL/Persian support and enterprise features.

### Why SurveyJS
- ✅ **Native RTL Support**: Built-in right-to-left layout for Persian/Arabic
- ✅ **Enterprise Ready**: MIT license, free for commercial use
- ✅ **Easy Theming**: Custom SAP Fiori theme via CSS
- ✅ **Better React Integration**: Official React wrapper
- ✅ **Rich Features**: Validation, conditional logic, multi-page forms
- ✅ **Mature Library**: Well-documented, actively maintained

### Components Implemented
- **SurveyFormRenderer** (`frontend/src/components/SurveyFormRenderer.tsx`)
  - SurveyJS Model wrapper with Persian locale
  - RTL direction support
  - Custom Fiori theme integration
  - Submit/Cancel handlers
  - Read-only mode support

- **Fiori Theme** (`frontend/src/styles/surveyjs-fiori-theme.css`)
  - SAP Fiori color palette (#0a6ed1 primary)
  - Bordered inputs with focus states
  - Proper dropdown styling
  - Error states with red borders
  - RTL-specific overrides

- **Schema Converter** (`frontend/src/utils/schemaConverter.ts`)
  - Converts Formio schema to SurveyJS format
  - Maps field types (textfield→text, select→dropdown, etc.)
  - Preserves validation rules
  - Persian error messages

### Key Features
- **RTL/Persian**: Full right-to-left layout, Persian translations
- **SAP Fiori Styling**: Custom theme matching Fiori design system
- **Form Types**: text, textarea, number, email, date, dropdown, boolean, file
- **Validation**: Required fields, regex patterns, min/max length
- **Multi-page**: Wizard-style forms with progress bar
- **Responsive**: Mobile-friendly layouts

### Bundle Size
- **Current**: 2.37MB (includes SurveyJS core + React UI)
- **Previous**: 3.27MB (with Formio.js)
- **Reduction**: 28% smaller than Formio

### Persian Translations
Complete Persian UI:
- Submit button: "ثبت"
- Previous/Next: "قبلی" / "بعدی"
- Required error: "این فیلد الزامی است"
- File upload: "انتخاب فایل"
- Cancel: "انصراف"

See **PHASE8-STEP1-SURVEYJS.md** for full implementation details.

---

## Enterprise Fonts & Bidirectional Text (Phase 8 Step 2)

### Objective
Implement professional typography and smart RTL/LTR direction support for multilingual forms.

### Typography Stack
- **English Forms**: Inter font family (Google Fonts CDN)
- **Persian Forms**: Vazir font family (optimized for Persian/Farsi)
- **Auto-Detection**: Backend automatically detects direction from form content

### Fonts Loaded
```html
<!-- Inter (English) - 300, 400, 500, 600, 700 weights -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<!-- Vazir (Persian) - v30.1.0 -->
<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css" rel="stylesheet">
```

### CSS Custom Properties
```css
:root {
  --font-english: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-persian: 'Vazir', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Direction Detection Logic
The backend auto-detects text direction based on Unicode ranges:
- **Persian/Arabic**: `\u0600-\u06FF`, `\u0750-\u077F`, `\uFB50-\uFDFF`, `\uFE70-\uFEFF`
- **Analyzes**: Form name, description, and field labels
- **Default**: LTR (English) for forms without Persian/Arabic characters

### Database Changes
```sql
-- New column added to forms table
ALTER TABLE forms
ADD COLUMN direction VARCHAR(3) DEFAULT 'ltr';

-- Constraint ensures only 'ltr' or 'rtl' values
ALTER TABLE forms
ADD CONSTRAINT direction_check CHECK (direction IN ('ltr', 'rtl'));
```

### Frontend Features
- ✅ **LTR by Default**: Application uses left-to-right layout
- ✅ **Per-Form Direction**: Each form can have its own direction
- ✅ **Visual Tags**: Forms show 'فارسی' (Persian) or 'English' tags
- ✅ **Font Switching**: Automatic font family change based on direction
- ✅ **SurveyJS Locale**: Switches between 'fa' and 'en' locales
- ✅ **Bidirectional CSS**: Theme supports both LTR and RTL layouts

### Files Modified
**Frontend (9 files):**
- `frontend/index.html` - Added Google Fonts imports
- `frontend/src/index.css` - Font variables and bidirectional styles
- `frontend/src/main.tsx` - Changed to LTR default
- `frontend/src/styles/surveyjs-fiori-theme.css` - Bidirectional support
- `frontend/src/components/SurveyFormRenderer.tsx` - Direction prop
- `frontend/src/types/index.ts` - Added direction field
- `frontend/src/pages/FormPage.tsx` - Direction tag display
- `frontend/src/components/FioriTile.tsx` - Direction tag on tiles
- `frontend/src/pages/FormsListPage.tsx` - Pass direction to tiles

**Backend (3 files):**
- `backend/src/models/form.model.ts` - Added direction field to Form interface
- `backend/src/services/form.service.ts` - Direction detection function
- `backend/init.sql` - Added direction column

**Migration:**
- `backend/migrations/001_add_direction_column.sql` - Migration for existing databases

### Usage Example
```typescript
// Creating a form automatically detects direction
const form = {
  name: "فرم ثبت‌نام کاربر",  // Persian text
  description: "لطفا اطلاعات خود را وارد کنید",
  fields: [...]
};
// → direction: 'rtl' (auto-detected)

// English form
const form = {
  name: "User Registration Form",
  description: "Please enter your information",
  fields: [...]
};
// → direction: 'ltr' (auto-detected)
```

See **PHASE8-STEP2-FONTS-DIRECTION.md** for full implementation details.

---

## SAP Fiori Launchpad (Phase 9)

### Objective
Implement SAP Fiori 3 style Launchpad with Spaces, Pages, Sections, and Tiles for the User Portal.

### Architecture
The launchpad uses a hierarchical structure:
- **Spaces** → Top-level tabs (Finance, HR, IT, etc.)
- **Pages** → Dropdown under each space (Loans, Leaves, etc.)
- **Sections** → Groups of tiles on a page (Personal Loans, etc.)
- **Tiles** → Individual forms displayed as cards

### Database Schema
```sql
-- Spaces (Top level navigation tabs)
CREATE TABLE spaces (
  id UUID PRIMARY KEY,
  name VARCHAR(255),           -- "مالی و اعتبارات"
  name_en VARCHAR(255),         -- "Finance & Credit"
  icon VARCHAR(50),             -- SAP UI5 icon name
  color VARCHAR(20),
  order_index INT,
  direction VARCHAR(3),
  is_active BOOLEAN
);

-- Pages (Under each space)
CREATE TABLE pages (
  id UUID PRIMARY KEY,
  space_id UUID REFERENCES spaces(id),
  name VARCHAR(255),
  icon VARCHAR(50),
  order_index INT,
  is_default BOOLEAN,
  is_active BOOLEAN
);

-- Sections (Groups of tiles on a page)
CREATE TABLE sections (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES pages(id),
  name VARCHAR(255),
  order_index INT,
  is_active BOOLEAN
);

-- Forms linked to sections
ALTER TABLE forms
  ADD COLUMN section_id UUID REFERENCES sections(id),
  ADD COLUMN icon VARCHAR(50),
  ADD COLUMN color VARCHAR(20),
  ADD COLUMN order_index INT;
```

### Sample Spaces
1. **مالی و اعتبارات** (Finance & Credit)
   - وام‌ها (Loans)
   - اعتبارات (Credits)

2. **منابع انسانی** (Human Resources)
   - مرخصی‌ها (Leaves)
   - اطلاعات پرسنلی (Personnel Info)

3. **فناوری اطلاعات** (Information Technology)
   - درخواست‌های IT (IT Requests)

4. **درخواست‌های من** (My Requests)
   - همه درخواست‌ها (All Requests)
   - در انتظار تایید (Pending)
   - تایید شده (Approved)

### Backend API
**GET /api/v1/launchpad/spaces** - Get all spaces with pages
**GET /api/v1/launchpad/pages/:pageId** - Get page content with sections and tiles
**GET /api/v1/launchpad/spaces/:spaceId/default-page** - Get default page ID

### Frontend Features
- ✅ **Space Tabs**: Top-level navigation tabs
- ✅ **Page Dropdown**: Multiple pages per space
- ✅ **Section Groups**: Organized tile groups
- ✅ **Tile Cards**: 160x160px cards with icons
- ✅ **Hover Effects**: Elevation and border highlight
- ✅ **RTL Support**: Proper direction for Persian content
- ✅ **Navigation**: Click tile → opens form
- ✅ **ShellBar**: APEX branding with notifications

### Files Created/Modified
**Backend (6 files):**
- `backend/migrations/002_add_launchpad_schema.sql` - Database schema
- `backend/src/models/launchpad.model.ts` - TypeScript models
- `backend/src/services/launchpad.service.ts` - Business logic
- `backend/src/routes/launchpad.routes.ts` - API routes
- `backend/src/routes/index.ts` - Routes registration

**Frontend (5 files):**
- `frontend/src/types/launchpad.ts` - TypeScript types
- `frontend/src/services/api.ts` - API client
- `frontend/src/pages/LaunchpadPage.tsx` - Main launchpad component
- `frontend/src/index.css` - Tile hover styles
- `frontend/src/App.tsx` - Router configuration

### Routing
- `/` → Redirects to `/launchpad`
- `/launchpad` → Shows first space
- `/launchpad/:spaceId/:pageId` → Shows specific page
- `/forms/:slug` → Opens form
- `/forms` → Redirects to `/launchpad`

### Usage
```bash
# Access launchpad
http://localhost:3000

# Direct to specific page
http://localhost:3000/launchpad/11111111-1111-1111-1111-111111111111/aaaa1111-1111-1111-1111-111111111111
```

See **PHASE9-USER-PORTAL-LAUNCHPAD.md** for full implementation details.

---

## SYNCRO Enterprise Visual Polish (Phase 9.5)

### Objective
Transform APEX to SYNCRO with professional enterprise branding, Royal Blue + Cyan gradient theme, and polished UI components.

### Brand Identity
- **Name**: SYNCRO
- **Tagline**: Business Process Platform
- **Primary Color**: Royal Blue (#4169E1)
- **Accent Color**: Cyan (#06B6D4)
- **Gradient**: 135deg from Royal Blue to Cyan

### Visual Enhancements

#### 1. Logo Assets
Created professional logo files:
- **`frontend/public/logo-original.png`** - Original SYNCRO logo (PNG)
- **`frontend/public/logo.svg`** - Vector logo icon (40x40px)
- **`frontend/public/logo-full.svg`** - Logo with text (160x40px)

Logo features globe/network shape with Royal Blue → Cyan gradient.

#### 2. Shell Bar Redesign
- ✅ **Gradient Background**: Linear gradient (135deg) from Royal Blue to Cyan
- ✅ **SYNCRO Branding**: Logo + "SYNCRO" text + tagline
- ✅ **User Profile**: "Ali Ahmadi" name displayed next to avatar
- ✅ **Notifications**: Bell icon with red badge (3 unread)
- ✅ **Hover Effects**: Subtle white overlay on icons and profile

#### 3. Profile Dropdown Menu
Interactive dropdown with 4 menu items:
- **Profile** - User profile page (icon: person-placeholder)
- **Settings** - Application settings (icon: action-settings)
- **About** - About SYNCRO (icon: hint)
- **Sign Out** - Logout and navigate to /login (icon: log, red color)

#### 4. Notifications Panel
Rich notification popover (320px wide) with:
- **4 Sample Notifications**:
  - Leave Request Approved (5 min ago) - unread
  - Performance Review Completed (2 hours ago) - unread
  - New Company Policy (1 day ago) - unread
  - Upcoming Event (2 days ago) - read
- **Visual Features**:
  - Unread: Blue background (#f0f9ff)
  - Icons: document, accept, message-information, calendar
  - Timestamps and full message text
  - Hover effects for better UX

#### 5. Color Palette (CSS Variables)

```css
/* SYNCRO Brand Colors */
--syncro-royal-blue: #4169E1
--syncro-cyan: #06B6D4
--syncro-royal-blue-dark: #2952CC
--syncro-cyan-light: #22D3EE

/* UI5 Theme Overrides */
--sapBrandColor: #4169E1
--sapHighlightColor: #06B6D4
--sapActiveColor: #4169E1
--sapSelectedColor: #4169E1
--sapLinkColor: #4169E1
```

#### 6. Updated UI Elements
All interface elements now use SYNCRO brand colors:
- **Space Tabs**: Royal Blue border for active state
- **Page Dropdowns**: Royal Blue text and icons
- **Section Titles**: Royal Blue underline (2px solid)
- **Tile Icons**: Royal Blue default color
- **Links**: Royal Blue (#4169E1)

#### 7. Typography
- **Font**: Vazirmatn (unified for both Persian and English)
- **Logo Text**: Bold (700), 18px, 0.5px letter-spacing
- **Tagline**: 12px, 90% white opacity
- **User Name**: 14px, 500 weight

### Files Modified

**Frontend (3 files):**
- `frontend/src/index.css` - Brand colors, UI5 overrides, font system
- `frontend/src/pages/LaunchpadPage.tsx` - Shell bar, profile, notifications
- `frontend/public/logo.svg` - NEW logo icon
- `frontend/public/logo-full.svg` - NEW logo with text

### UI Language
All interface text is in **English** for international audience:
- Notifications in English
- Profile menu in English
- Shell bar text in English

### Visual Result
```
┌────────────────────────────────────────────────────────────┐
│ [🌐] SYNCRO                          🔔3    Ali Ahmadi [👤] │
│ ══════════════════════════════════════════════════════════ │
│  Gradient: Royal Blue (#4169E1) → Cyan (#06B6D4)           │
├────────────────────────────────────────────────────────────┤
│                                      ┌──────────────────┐  │
│                                      │ 👤 Profile       │  │
│                                      │ ⚙️ Settings      │  │
│                                      │ ℹ️ About         │  │
│                                      │ 🚪 Sign Out      │  │
│                                      └──────────────────┘  │
├────────────────────────────────────────────────────────────┤
│ Finance | ▼    Human Resources | ▼    IT                   │
│                                                             │
│  Personal Loans (Royal Blue underline)                     │
│  ─────────────────                                         │
│  [Tile] [Tile] [Tile]                                      │
└────────────────────────────────────────────────────────────┘
```

### Professional Impact
- ✅ **Modern Brand Identity**: Professional SYNCRO branding
- ✅ **Enterprise Look**: Royal Blue + Cyan gradient conveys trust
- ✅ **User-Friendly**: Clear visual hierarchy and interactions
- ✅ **Consistent Theme**: All elements use brand colors
- ✅ **Engaging UX**: Smooth hover effects and transitions

See **PHASE9.5-VISUAL-POLISH.md** for full specification and implementation details.

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

**Last Updated:** 2025-12-19
**Status:** Phase 9.5 (SYNCRO Enterprise Visual Polish) COMPLETED
