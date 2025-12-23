# PHASE 13F: Configurable Form Navigation

## Overview

Add `navigation_type` column to forms table to make navigation style configurable per form.

---

## Part 1: Database Migration

### File: `backend/migrations/015_add_navigation_type.sql`

```sql
-- Migration 015: Add navigation_type column to forms table

-- Add column with default value
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS navigation_type VARCHAR(20) DEFAULT 'default';

-- Add comment explaining values
COMMENT ON COLUMN forms.navigation_type IS 'Navigation style: default, toc-left, toc-right, progress-buttons';

-- Update test forms with their navigation types
UPDATE forms SET navigation_type = 'toc-left' WHERE slug = 'nav-test-toc-sidebar';
UPDATE forms SET navigation_type = 'progress-buttons' WHERE slug = 'nav-test-progress-buttons';

-- Remove navigation settings from schema (optional cleanup - keep schema clean)
-- These settings will now come from navigation_type column instead
UPDATE forms 
SET schema = schema - 'showTOC' - 'tocLocation' - 'progressBarType'
WHERE slug LIKE 'nav-test-%';

-- Verify
SELECT slug, name, navigation_type FROM forms ORDER BY slug;
```

---

## Part 2: Backend Updates

### 2.1 Update Form Model

**File: `backend/src/models/form.model.ts`**

Add to Form interface:
```typescript
export interface Form {
  id: string;
  slug: string;
  name: string;
  name_fa: string;
  description?: string;
  schema: any;
  status: string;
  icon?: string;
  color?: string;
  direction: 'ltr' | 'rtl';
  navigation_type: 'default' | 'toc-left' | 'toc-right' | 'progress-buttons';  // ADD THIS
  created_at?: Date;
  updated_at?: Date;
}
```

### 2.2 Update Form Service

**File: `backend/src/services/form.service.ts`**

Ensure `navigation_type` is included in SELECT queries:
```typescript
// In getFormBySlug or similar:
const result = await pool.query(
  `SELECT id, slug, name, name_fa, description, schema, status, 
          icon, color, direction, navigation_type
   FROM forms WHERE slug = $1`,
  [slug]
);
```

### 2.3 Update Admin Service (for CRUD)

**File: `backend/src/services/admin.service.ts`**

If there's a forms CRUD, add `navigation_type` to:
- getAllForms SELECT
- createForm INSERT
- updateForm UPDATE

---

## Part 3: Frontend Updates

### 3.1 Update Form Type

**File: `frontend/src/types/form.ts`** (or wherever Form type is defined)

```typescript
export interface Form {
  id: string;
  slug: string;
  name: string;
  name_fa: string;
  description?: string;
  schema: any;
  status: string;
  icon?: string;
  color?: string;
  direction: 'ltr' | 'rtl';
  navigation_type: 'default' | 'toc-left' | 'toc-right' | 'progress-buttons';  // ADD THIS
}
```

### 3.2 Update SurveyFormRenderer

**File: `frontend/src/components/SurveyFormRenderer.tsx`**

Add `navigationType` prop and apply settings:

```typescript
interface SurveyFormRendererProps {
  schema: any;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
  initialData?: Record<string, any>;
  direction?: 'ltr' | 'rtl';
  navigationType?: 'default' | 'toc-left' | 'toc-right' | 'progress-buttons';  // ADD THIS
}

export function SurveyFormRenderer({
  schema,
  onSubmit,
  onCancel,
  loading,
  readOnly,
  initialData,
  direction = 'ltr',
  navigationType = 'default',  // ADD THIS
}: SurveyFormRendererProps) {
  const survey = new Model(schema);

  // Apply official theme
  survey.applyTheme(fioriTheme);
  
  // Apply navigation settings based on navigationType
  switch (navigationType) {
    case 'toc-left':
      survey.showTOC = true;
      survey.tocLocation = 'left';
      break;
    case 'toc-right':
      survey.showTOC = true;
      survey.tocLocation = 'right';
      break;
    case 'progress-buttons':
      survey.showProgressBar = 'top';
      survey.progressBarType = 'buttons';
      survey.showTOC = false;
      break;
    case 'default':
    default:
      // Keep default behavior (Next/Previous only)
      survey.showTOC = false;
      break;
  }

  // ... rest of the component
}
```

### 3.3 Update FormPage

**File: `frontend/src/pages/FormPage.tsx`**

Pass `navigation_type` to SurveyFormRenderer:

```typescript
// Where form data is used:
<SurveyFormRenderer
  schema={form.schema}
  onSubmit={handleSubmit}
  direction={form.direction}
  navigationType={form.navigation_type}  // ADD THIS
/>
```

---

## Part 4: Navigation Type Reference

| Value | Description | UI |
|-------|-------------|----|
| `default` | Linear navigation | Next/Previous buttons only |
| `toc-left` | Table of Contents | Left sidebar with page list |
| `toc-right` | Table of Contents | Right sidebar with page list |
| `progress-buttons` | Progress bar buttons | Top clickable tabs |

---

## Implementation Steps

1. Create `backend/migrations/015_add_navigation_type.sql`
2. Run migration:
   ```bash
   docker exec -i apex-postgres psql -U apex -d apex < backend/migrations/015_add_navigation_type.sql
   ```
3. Update `backend/src/models/form.model.ts` - add navigation_type to interface
4. Update `backend/src/services/form.service.ts` - include navigation_type in queries
5. Update `frontend/src/types/` - add navigation_type to Form type
6. Update `frontend/src/components/SurveyFormRenderer.tsx` - add prop and switch logic
7. Update `frontend/src/pages/FormPage.tsx` - pass navigationType prop
8. Rebuild backend and frontend

---

## Testing

After implementation, test all navigation types:

| Form | URL | Expected |
|------|-----|----------|
| Default | http://localhost:3000/forms/it (any existing) | Next/Previous only |
| TOC Left | http://localhost:3000/forms/nav-test-toc-sidebar | Left sidebar |
| Progress Buttons | http://localhost:3000/forms/nav-test-progress-buttons | Top tabs |

---

## Future: Admin UI

Later, add dropdown to Manage Forms page:

```tsx
<Select
  label="Navigation Style"
  value={form.navigation_type}
  onChange={(value) => setForm({...form, navigation_type: value})}
>
  <Option value="default">Default (Next/Previous)</Option>
  <Option value="toc-left">Sidebar (Left)</Option>
  <Option value="toc-right">Sidebar (Right)</Option>
  <Option value="progress-buttons">Top Tabs</Option>
</Select>
```
