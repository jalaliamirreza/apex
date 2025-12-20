# PHASE 11: Admin CRUD Applications

## Overview

Create 4 admin management applications for the SYNCRO launchpad system. Each app provides CRUD operations for managing the launchpad structure.

## Architecture

```
Backend:
  /api/v1/admin/spaces      - Spaces CRUD
  /api/v1/admin/pages       - Pages CRUD  
  /api/v1/admin/sections    - Sections CRUD
  /api/v1/admin/tiles       - Tiles CRUD

Frontend:
  /app/manage-spaces    → ManageSpacesPage.tsx
  /app/manage-pages     → ManagePagesPage.tsx
  /app/manage-sections  → ManageSectionsPage.tsx
  /app/manage-tiles     → ManageTilesPage.tsx
```

---

## Part 1: Backend Admin Service

### File: `backend/src/services/admin.service.ts`

Create CRUD operations for all 4 entities:

```typescript
// Each entity needs:
// - getAll(filterParam?) - List with optional filter
// - getById(id) - Single record
// - create(data) - Insert new
// - update(id, data) - Partial update
// - delete(id) - Remove

// SPACES
getAllSpaces(): Promise<Space[]>
getSpaceById(id: string): Promise<Space | null>
createSpace(data: CreateSpaceDto): Promise<Space>
updateSpace(id: string, data: UpdateSpaceDto): Promise<Space | null>
deleteSpace(id: string): Promise<void>

// PAGES - filter by spaceId
getAllPages(spaceId?: string): Promise<Page[]>
// ... same pattern

// SECTIONS - filter by pageId
getAllSections(pageId?: string): Promise<Section[]>
// ... same pattern

// TILES - filter by sectionId
getAllTiles(sectionId?: string): Promise<Tile[]>
// ... same pattern
```

**Database field mapping:**
- TypeScript uses camelCase: `nameFa`, `orderIndex`, `isActive`
- PostgreSQL uses snake_case: `name_fa`, `order_index`, `is_active`
- Service must handle this conversion

---

## Part 2: Backend Admin Routes

### File: `backend/src/routes/admin.routes.ts`

REST endpoints for each entity:

```
GET    /spaces              - List all spaces
GET    /spaces/:id          - Get single space
POST   /spaces              - Create space
PUT    /spaces/:id          - Update space
DELETE /spaces/:id          - Delete space

GET    /pages?spaceId=      - List pages (optional filter)
GET    /pages/:id           - Get single page
POST   /pages               - Create page
PUT    /pages/:id           - Update page
DELETE /pages/:id           - Delete page

GET    /sections?pageId=    - List sections (optional filter)
GET    /sections/:id        - Get single section
POST   /sections            - Create section
PUT    /sections/:id        - Update section
DELETE /sections/:id        - Delete section

GET    /tiles?sectionId=    - List tiles (optional filter)
GET    /tiles/:id           - Get single tile
POST   /tiles               - Create tile
PUT    /tiles/:id           - Update tile
DELETE /tiles/:id           - Delete tile
```

**Error handling:**
- 400 for validation errors (duplicate slug)
- 404 for not found
- 500 for server errors

### Register in `backend/src/routes/index.ts`:
```typescript
import adminRoutes from './admin.routes';
router.use('/admin', adminRoutes);
```

---

## Part 3: Frontend Admin API Client

### File: `frontend/src/services/adminApi.ts`

```typescript
// Types matching backend snake_case (as returned from API)
interface Space {
  id: string;
  name: string;
  name_fa: string;
  slug: string;
  icon: string;
  color: string;
  order_index: number;
  direction: 'ltr' | 'rtl';
  is_active: boolean;
}

// Similar for Page, Section, Tile

// API functions
export const spacesApi = {
  getAll: () => api.get('/admin/spaces').then(r => r.data.spaces),
  getById: (id) => api.get(`/admin/spaces/${id}`).then(r => r.data),
  create: (data) => api.post('/admin/spaces', data).then(r => r.data),
  update: (id, data) => api.put(`/admin/spaces/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/admin/spaces/${id}`)
};

// Same pattern for pagesApi, sectionsApi, tilesApi
```

---

## Part 4: Reusable Admin Components

### File: `frontend/src/components/AdminLayout.tsx`

Shared layout for all admin pages:
- Header with back button, icon, title (EN + FA)
- Actions slot (for Add button, filters)
- Content area with gray background

### File: `frontend/src/components/AdminTable.tsx`

Generic data table component:
- Configurable columns
- Edit/Delete action buttons per row
- Loading state
- Empty state

### File: `frontend/src/components/AdminDialog.tsx`

Generic form dialog:
- Create/Edit mode
- Field configuration
- Validation
- Error display

---

## Part 5: Admin Pages

### Common Features for All Pages:
1. Load data on mount
2. Filter dropdown (except Spaces)
3. Add button opens create dialog
4. Table with edit/delete actions
5. Edit opens dialog with pre-filled data
6. Delete shows confirmation dialog
7. Error/success messages

### File: `frontend/src/pages/admin/ManageSpacesPage.tsx`

**Table columns:**
| Order | Icon | Name (EN) | Name (FA) | Slug | Color | Direction | Active | Actions |

**Form fields:**
- name (required, auto-generates slug)
- name_fa (required, RTL input)
- slug (required, editable)
- icon (select from predefined list)
- color (color picker or select)
- order_index (number)
- direction (select: RTL/LTR)
- is_active (checkbox)

**Icons list:** folder, money-bills, employee, it-host, outbox, settings, home, factory, customer

**Colors list:** #0a6ed1, #6366f1, #8b5cf6, #ec4899, #f59e0b, #10b981, #ef4444

---

### File: `frontend/src/pages/admin/ManagePagesPage.tsx`

**Filter:** Space dropdown

**Table columns:**
| Order | Space | Icon | Name (EN) | Name (FA) | Slug | Default | Active | Actions |

**Form fields:**
- space_id (required, select from spaces)
- name (required)
- name_fa (required)
- slug (required)
- icon (select)
- order_index (number)
- is_default (checkbox)
- is_active (checkbox)

---

### File: `frontend/src/pages/admin/ManageSectionsPage.tsx`

**Filter:** Page dropdown (shows: Space → Page)

**Table columns:**
| Order | Space | Page | Name (EN) | Name (FA) | Active | Actions |

**Form fields:**
- page_id (required, select showing "Space → Page")
- name (required)
- name_fa (required)
- order_index (number)
- is_active (checkbox)

---

### File: `frontend/src/pages/admin/ManageTilesPage.tsx`

**Filter:** Section dropdown (shows: Space → Page → Section)

**Table columns:**
| Order | Icon | Name (EN) | Name (FA) | Slug | Type | Section | Active | Actions |

**Form fields:**
- section_id (required, select showing full path)
- name (required)
- name_fa (required)
- slug (required)
- description (optional)
- icon (select)
- color (select)
- type (select: form, app, link, kpi)
- order_index (number)
- direction (select)
- config (JSON textarea)
- is_active (checkbox)

**Type badge colors:**
- app: blue (#dbeafe / #1e40af)
- form: green (#dcfce7 / #166534)
- link: yellow (#fef3c7 / #92400e)
- kpi: purple (#f3e8ff / #7c3aed)

---

## Part 6: Route Updates

### File: `frontend/src/App.tsx`

Add routes:
```tsx
import ManageSpacesPage from './pages/admin/ManageSpacesPage';
import ManagePagesPage from './pages/admin/ManagePagesPage';
import ManageSectionsPage from './pages/admin/ManageSectionsPage';
import ManageTilesPage from './pages/admin/ManageTilesPage';

// Inside Routes:
<Route path="/app/manage-spaces" element={<ManageSpacesPage />} />
<Route path="/app/manage-pages" element={<ManagePagesPage />} />
<Route path="/app/manage-sections" element={<ManageSectionsPage />} />
<Route path="/app/manage-tiles" element={<ManageTilesPage />} />
```

Remove or keep AdminAppPage.tsx as fallback for unknown /app/:slug routes.

---

## UI5 Components to Use

```tsx
import {
  FlexBox,
  Title,
  Button,
  Icon,
  Table,
  TableColumn,
  TableRow,
  TableCell,
  Dialog,
  Bar,
  Input,
  Label,
  Select,
  Option,
  MessageStrip,
  BusyIndicator,
  CheckBox,
  TextArea
} from '@ui5/webcomponents-react';
```

---

## Implementation Order

1. Backend admin.service.ts (all CRUD operations)
2. Backend admin.routes.ts (all endpoints)
3. Register routes in index.ts
4. Frontend adminApi.ts (API client)
5. Frontend AdminLayout.tsx (shared layout)
6. Frontend ManageSpacesPage.tsx (simplest, no filter)
7. Frontend ManagePagesPage.tsx (filter by space)
8. Frontend ManageSectionsPage.tsx (filter by page)
9. Frontend ManageTilesPage.tsx (most complex, filter by section)
10. Update App.tsx routes

---

## Testing Checklist

- [ ] Spaces: Create, Read, Update, Delete
- [ ] Pages: CRUD with space filter
- [ ] Sections: CRUD with page filter
- [ ] Tiles: CRUD with section filter
- [ ] Slug uniqueness validation
- [ ] Cascade delete warning
- [ ] Persian text renders correctly
- [ ] Icons display in tables
- [ ] Back navigation to /launchpad/admin/system
