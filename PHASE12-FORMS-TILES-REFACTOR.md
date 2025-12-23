# PHASE 12: Forms-Tiles Architecture Refactoring

## Overview

Refactor the relationship between Forms and Tiles for cleaner architecture:
- **Before:** Forms appear on launchpad via `forms.section_id` (confusing)
- **After:** Only Tiles appear on launchpad. Forms are linked via `tiles.form_id`

## Architecture

```
BEFORE (Confusing):
Section
├── Forms (section_id) → appears on launchpad
└── Tiles (section_id) → appears on launchpad

AFTER (Clean):
Section
└── Tiles (ONLY source)
    ├── type='form' → links to form via form_id
    ├── type='app'  → route in config
    ├── type='link' → URL in config
    └── type='kpi'  → KPI data in config

Forms Table = Form definitions only (schema, submissions)
Tiles Table = What appears on launchpad
```

---

## Part 1: Database Migration

### File: `backend/migrations/007_refactor_forms_tiles.sql`

```sql
-- Migration 007: Refactor Forms-Tiles Relationship
-- Date: 2025-12-20
-- Purpose: Forms no longer appear directly on launchpad. Tiles link to forms.

-- Step 1: Add form_id column to tiles table
ALTER TABLE tiles ADD COLUMN IF NOT EXISTS form_id UUID REFERENCES forms(id) ON DELETE SET NULL;

-- Step 2: Create tiles for existing forms that have section_id
INSERT INTO tiles (section_id, name, name_fa, description, icon, color, slug, type, order_index, direction, form_id, is_active)
SELECT 
  f.section_id,
  f.name,
  f.name_fa,
  f.description,
  COALESCE(f.icon, 'document'),
  COALESCE(f.color, '#0a6ed1'),
  f.slug,
  'form',
  COALESCE(f.order_index, 0),
  f.direction,
  f.id,
  true
FROM forms f
WHERE f.section_id IS NOT NULL
  AND f.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM tiles t WHERE t.form_id = f.id
  );

-- Step 3: Remove section_id from forms table (optional - keep for reference or drop)
-- For now, we keep it but stop using it
-- ALTER TABLE forms DROP COLUMN section_id;

-- Step 4: Create index on form_id
CREATE INDEX IF NOT EXISTS idx_tiles_form_id ON tiles(form_id);
```

### Run Migration
```bash
Get-Content D:\Worklab\SAP\AI\apex\backend\migrations\007_refactor_forms_tiles.sql | docker exec -i apex-postgres psql -U apex -d apex
```

---

## Part 2: Update Launchpad Service

### File: `backend/src/services/launchpad.service.ts`

**Change:** Remove UNION ALL. Query only tiles table. Join forms when type='form'.

```typescript
// Get page content - ONLY from tiles table
export async function getPageContent(pageId: string): Promise<Page | null> {
  // Get page
  const pageResult = await query(
    'SELECT * FROM pages WHERE id = $1 AND is_active = true',
    [pageId]
  );

  if (pageResult.rows.length === 0) return null;
  const page = pageResult.rows[0];

  // Get sections with tiles (join form data when type='form')
  const sectionsResult = await query(`
    SELECT sec.*,
      COALESCE((
        SELECT json_agg(
          json_build_object(
            'id', t.id,
            'name', t.name,
            'name_fa', t.name_fa,
            'description', t.description,
            'icon', COALESCE(t.icon, 'document'),
            'color', COALESCE(t.color, '#0a6ed1'),
            'slug', CASE WHEN t.type = 'form' AND f.slug IS NOT NULL THEN f.slug ELSE t.slug END,
            'type', t.type,
            'order_index', COALESCE(t.order_index, 0),
            'direction', t.direction,
            'config', t.config,
            'form_id', t.form_id
          ) ORDER BY t.order_index
        )
        FROM tiles t
        LEFT JOIN forms f ON t.form_id = f.id
        WHERE t.section_id = sec.id AND t.is_active = true
      ), '[]') as tiles
    FROM sections sec
    WHERE sec.page_id = $1 AND sec.is_active = true
    ORDER BY sec.order_index
  `, [pageId]);

  return {
    id: page.id,
    space_id: page.space_id,
    name: page.name,
    name_fa: page.name_fa,
    slug: page.slug,
    icon: page.icon,
    order_index: page.order_index,
    is_default: page.is_default,
    is_active: page.is_active,
    sections: sectionsResult.rows.map((row: any) => ({
      id: row.id,
      page_id: row.page_id,
      name: row.name,
      name_fa: row.name_fa,
      order_index: row.order_index,
      is_active: row.is_active,
      tiles: row.tiles
    }))
  };
}
```

---

## Part 3: Update Admin Service - Tiles

### File: `backend/src/services/admin.service.ts`

**Add `form_id` to Tile operations:**

```typescript
// Update CreateTileDto
export interface CreateTileDto {
  section_id: string;
  name: string;
  name_fa?: string;
  description?: string;
  icon: string;
  color: string;
  slug: string;
  type: 'form' | 'link' | 'kpi' | 'app';
  order_index: number;
  direction?: 'ltr' | 'rtl';
  config?: Record<string, any>;
  form_id?: string;  // ADD THIS
  is_active: boolean;
}

// Update UpdateTileDto
export interface UpdateTileDto {
  // ... existing fields ...
  form_id?: string;  // ADD THIS
}

// Update getAllTiles - include form_id and form info
export async function getAllTiles(sectionId?: string): Promise<Tile[]> {
  let sql = `
    SELECT t.*, f.name as form_name, f.slug as form_slug
    FROM tiles t
    LEFT JOIN forms f ON t.form_id = f.id
  `;
  // ... rest of function
}

// Update createTile - include form_id
export async function createTile(data: CreateTileDto): Promise<Tile> {
  const result = await query(`
    INSERT INTO tiles (section_id, name, name_fa, description, icon, color, slug, type, order_index, direction, config, form_id, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `, [
    data.section_id,
    data.name,
    data.name_fa,
    data.description,
    data.icon,
    data.color,
    data.slug,
    data.type,
    data.order_index,
    data.direction,
    data.config ? JSON.stringify(data.config) : null,
    data.form_id || null,  // ADD THIS
    data.is_active
  ]);
  // ... return mapping
}

// Update updateTile - handle form_id
// Add form_id field handling in the update function
```

---

## Part 4: Create Admin Forms Service

### File: `backend/src/services/admin-forms.service.ts`

```typescript
import { query } from '../config/database';

export interface FormListItem {
  id: string;
  name: string;
  name_fa: string;
  slug: string;
  description: string | null;
  status: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFormDto {
  name: string;
  name_fa?: string;
  slug: string;
  description?: string;
  schema: object;
  status: string;
  icon?: string;
  color?: string;
}

export interface UpdateFormDto {
  name?: string;
  name_fa?: string;
  slug?: string;
  description?: string;
  schema?: object;
  status?: string;
  icon?: string;
  color?: string;
}

// Get all forms (for listing and for tile form selector)
export async function getAllForms(): Promise<FormListItem[]> {
  const result = await query(`
    SELECT id, name, name_fa, slug, description, status, icon, color, created_at, updated_at
    FROM forms
    ORDER BY name
  `);
  return result.rows;
}

// Get form by ID
export async function getFormById(id: string) {
  const result = await query('SELECT * FROM forms WHERE id = $1', [id]);
  return result.rows[0] || null;
}

// Create form
export async function createForm(data: CreateFormDto) {
  const result = await query(`
    INSERT INTO forms (name, name_fa, slug, description, schema, status, icon, color)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    data.name,
    data.name_fa,
    data.slug,
    data.description,
    JSON.stringify(data.schema),
    data.status,
    data.icon || 'document',
    data.color || '#0a6ed1'
  ]);
  return result.rows[0];
}

// Update form
export async function updateForm(id: string, data: UpdateFormDto) {
  // Dynamic field building like other update functions
  // ... implementation
}

// Delete form
export async function deleteForm(id: string): Promise<void> {
  // First unlink from tiles
  await query('UPDATE tiles SET form_id = NULL WHERE form_id = $1', [id]);
  // Then delete form
  await query('DELETE FROM forms WHERE id = $1', [id]);
}
```

---

## Part 5: Create Admin Forms Routes

### File: `backend/src/routes/admin-forms.routes.ts`

```typescript
import { Router } from 'express';
import * as adminFormsService from '../services/admin-forms.service';

const router = Router();

// GET /api/v1/admin/forms - List all forms
router.get('/', async (req, res) => {
  try {
    const forms = await adminFormsService.getAllForms();
    res.json({ forms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get forms' });
  }
});

// GET /api/v1/admin/forms/:id - Get form by ID
router.get('/:id', async (req, res) => {
  try {
    const form = await adminFormsService.getFormById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get form' });
  }
});

// POST /api/v1/admin/forms - Create form
router.post('/', async (req, res) => {
  try {
    const form = await adminFormsService.createForm(req.body);
    res.status(201).json(form);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// PUT /api/v1/admin/forms/:id - Update form
router.put('/:id', async (req, res) => {
  try {
    const form = await adminFormsService.updateForm(req.params.id, req.body);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// DELETE /api/v1/admin/forms/:id - Delete form
router.delete('/:id', async (req, res) => {
  try {
    await adminFormsService.deleteForm(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

export default router;
```

### Register in `backend/src/routes/index.ts`:
```typescript
import adminFormsRoutes from './admin-forms.routes';
router.use('/admin/forms', adminFormsRoutes);
```

---

## Part 6: Frontend - Update Admin API

### File: `frontend/src/services/adminApi.ts`

**Add forms API and update tiles type:**

```typescript
// Add Form type
export interface Form {
  id: string;
  name: string;
  name_fa: string;
  slug: string;
  description: string | null;
  status: string;
  icon: string;
  color: string;
  schema?: object;
}

// Update Tile type - add form_id
export interface Tile {
  id: string;
  section_id: string;
  name: string;
  name_fa: string;
  description: string | null;
  icon: string;
  color: string;
  slug: string;
  type: 'form' | 'link' | 'kpi' | 'app';
  order_index: number;
  direction: 'ltr' | 'rtl' | null;
  config: Record<string, any> | null;
  form_id: string | null;  // ADD THIS
  is_active: boolean;
  // Joined fields
  form_name?: string;
  form_slug?: string;
}

// Add forms API
export const formsApi = {
  getAll: () => api.get('/admin/forms').then(r => r.data.forms),
  getById: (id: string) => api.get(`/admin/forms/${id}`).then(r => r.data),
  create: (data: Partial<Form>) => api.post('/admin/forms', data).then(r => r.data),
  update: (id: string, data: Partial<Form>) => api.put(`/admin/forms/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/admin/forms/${id}`)
};
```

---

## Part 7: Frontend - Update ManageTilesPage

### File: `frontend/src/pages/admin/ManageTilesPage.tsx`

**Add form selector when type='form':**

```tsx
// Add state for forms list
const [forms, setForms] = useState<Form[]>([]);

// Load forms on mount
useEffect(() => {
  formsApi.getAll().then(setForms);
}, []);

// In form dialog, show form selector when type='form':
{formData.type === 'form' && (
  <div>
    <Label>Form</Label>
    <Select
      value={formData.form_id || ''}
      onChange={(e) => setFormData({...formData, form_id: e.target.value})}
    >
      <Option value="">-- Select Form --</Option>
      {forms.map(form => (
        <Option key={form.id} value={form.id}>
          {form.name} ({form.name_fa})
        </Option>
      ))}
    </Select>
  </div>
)}

// In table, show linked form name for type='form' tiles:
// Add column or show in description
```

---

## Part 8: Frontend - Create ManageFormsPage

### File: `frontend/src/pages/admin/ManageFormsPage.tsx`

**Table columns:**
| Order | Icon | Name (EN) | Name (FA) | Slug | Status | Actions |

**Form fields:**
- name (required)
- name_fa (required)
- slug (required)
- description (optional)
- status (select: active, draft, archived)
- icon (select)
- color (select)
- schema (JSON textarea - read-only or basic editor)

**Notes:**
- Full form builder is future work
- For now, schema is JSON textarea
- Show warning when deleting (will unlink from tiles)

---

## Part 9: Add Manage Forms Tile to Admin

### SQL to run after migration:

```sql
-- Add Manage Forms tile to admin section
INSERT INTO tiles (id, section_id, name, name_fa, description, icon, color, slug, type, order_index, config, is_active)
VALUES (
  'tile5555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  'Manage Forms',
  'مدیریت فرم‌ها',
  'Create, edit, and manage form definitions',
  'form',
  '#10b981',
  'manage-forms',
  'app',
  5,
  '{"route": "/app/manage-forms", "permissions": ["admin.forms.manage"]}'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;
```

---

## Part 10: Update App.tsx Routes

### File: `frontend/src/App.tsx`

```tsx
import ManageFormsPage from './pages/admin/ManageFormsPage';

// Add route:
<Route path="/app/manage-forms" element={<ManageFormsPage />} />
```

---

## Implementation Order

1. Create and run migration `007_refactor_forms_tiles.sql`
2. Update `backend/src/services/launchpad.service.ts` - remove UNION ALL
3. Update `backend/src/services/admin.service.ts` - add form_id to tiles
4. Create `backend/src/services/admin-forms.service.ts`
5. Create `backend/src/routes/admin-forms.routes.ts`
6. Register routes in `backend/src/routes/index.ts`
7. Update `frontend/src/services/adminApi.ts` - add forms API, update Tile type
8. Update `frontend/src/pages/admin/ManageTilesPage.tsx` - add form selector
9. Create `frontend/src/pages/admin/ManageFormsPage.tsx`
10. Update `frontend/src/App.tsx` - add route
11. Run SQL to add "Manage Forms" tile

---

## Testing Checklist

- [ ] Migration runs without errors
- [ ] Existing forms appear as tiles on launchpad
- [ ] Launchpad still loads correctly (no UNION ALL)
- [ ] Manage Tiles shows form_id column/selector
- [ ] Creating tile with type='form' requires form selection
- [ ] Manage Forms page lists all forms
- [ ] Manage Forms CRUD operations work
- [ ] Deleting form unlinks from tiles (doesn't delete tile)
- [ ] "Manage Forms" tile appears in admin section
