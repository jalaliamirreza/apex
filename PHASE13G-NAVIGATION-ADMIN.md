# PHASE 13G: Add Navigation Type to Manage Forms

## Overview

Add `navigation_type` column and edit capability to the existing Manage Forms admin page.

---

## Current State

- Manage Forms page exists at `/app/manage-forms`
- Forms table has `navigation_type` column (added in migration 015)
- Backend returns `navigation_type` in API responses
- Missing: UI to view/edit navigation_type

---

## Part 1: Backend Verification

### File: `backend/src/services/admin.service.ts`

Ensure forms CRUD includes `navigation_type`:

**getAllForms:**
```sql
SELECT id, slug, name, name_fa, description, icon, color, status, direction, navigation_type, created_at, updated_at
FROM forms
ORDER BY name
```

**updateForm:**
```sql
UPDATE forms SET
  name = $1,
  name_fa = $2,
  description = $3,
  icon = $4,
  color = $5,
  status = $6,
  direction = $7,
  navigation_type = $8,
  updated_at = NOW()
WHERE id = $9
```

---

## Part 2: Frontend - Update Manage Forms Page

### File: `frontend/src/pages/admin/ManageFormsPage.tsx`

### 2.1 Add Navigation Type Column to Table

After "Status" column, add:
```tsx
<TableColumn>Navigation</TableColumn>
```

### 2.2 Add Cell in Table Row

After status cell, add:
```tsx
<TableCell>
  <span style={{
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    background: getNavigationBadgeColor(form.navigation_type).bg,
    color: getNavigationBadgeColor(form.navigation_type).text
  }}>
    {getNavigationLabel(form.navigation_type)}
  </span>
</TableCell>
```

### 2.3 Add Helper Functions

```tsx
const getNavigationLabel = (type: string): string => {
  switch (type) {
    case 'toc-left': return 'Sidebar Left';
    case 'toc-right': return 'Sidebar Right';
    case 'progress-buttons': return 'Top Tabs';
    case 'default':
    default: return 'Default';
  }
};

const getNavigationBadgeColor = (type: string): { bg: string; text: string } => {
  switch (type) {
    case 'toc-left': return { bg: '#dbeafe', text: '#1e40af' };      // Blue
    case 'toc-right': return { bg: '#e0e7ff', text: '#3730a3' };     // Indigo
    case 'progress-buttons': return { bg: '#dcfce7', text: '#166534' }; // Green
    case 'default':
    default: return { bg: '#f3f4f6', text: '#374151' };              // Gray
  }
};
```

### 2.4 Update Form State Interface

```tsx
interface FormData {
  id?: string;
  name: string;
  name_fa: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  status: string;
  direction: string;
  navigation_type: string;  // ADD THIS
}

// Initial state
const emptyForm: FormData = {
  name: '',
  name_fa: '',
  slug: '',
  description: '',
  icon: 'document',
  color: '#0a6ed1',
  status: 'active',
  direction: 'ltr',
  navigation_type: 'default',  // ADD THIS
};
```

### 2.5 Add Dropdown in Edit Dialog

After direction/status fields, add:

```tsx
<div style={{ marginBottom: '1rem' }}>
  <Label>Navigation Style</Label>
  <Select
    style={{ width: '100%' }}
    value={formData.navigation_type}
    onChange={(e) => setFormData({
      ...formData, 
      navigation_type: e.detail.selectedOption?.dataset?.value || 'default'
    })}
  >
    <Option data-value="default" selected={formData.navigation_type === 'default'}>
      Default (Next/Previous only)
    </Option>
    <Option data-value="toc-left" selected={formData.navigation_type === 'toc-left'}>
      Sidebar Left
    </Option>
    <Option data-value="toc-right" selected={formData.navigation_type === 'toc-right'}>
      Sidebar Right
    </Option>
    <Option data-value="progress-buttons" selected={formData.navigation_type === 'progress-buttons'}>
      Top Tabs (Progress Buttons)
    </Option>
  </Select>
</div>
```

### 2.6 Update Edit Handler

When opening edit dialog, include navigation_type:
```tsx
const handleEdit = (form: Form) => {
  setFormData({
    id: form.id,
    name: form.name,
    name_fa: form.name_fa,
    slug: form.slug,
    description: form.description || '',
    icon: form.icon || 'document',
    color: form.color || '#0a6ed1',
    status: form.status,
    direction: form.direction || 'ltr',
    navigation_type: form.navigation_type || 'default',  // ADD THIS
  });
  setDialogOpen(true);
};
```

### 2.7 Update Save Handler

Include navigation_type in update payload:
```tsx
const handleSave = async () => {
  try {
    await adminApi.forms.update(formData.id, {
      name: formData.name,
      name_fa: formData.name_fa,
      description: formData.description,
      icon: formData.icon,
      color: formData.color,
      status: formData.status,
      direction: formData.direction,
      navigation_type: formData.navigation_type,  // ADD THIS
    });
    loadForms();
    setDialogOpen(false);
  } catch (err) {
    setError('Failed to save form');
  }
};
```

---

## Part 3: Update Admin API Client (if needed)

### File: `frontend/src/services/adminApi.ts`

Ensure Form interface includes navigation_type:
```tsx
interface Form {
  id: string;
  slug: string;
  name: string;
  name_fa: string;
  description?: string;
  schema?: any;
  status: string;
  icon?: string;
  color?: string;
  direction: string;
  navigation_type: string;  // ADD THIS
  created_at?: string;
  updated_at?: string;
}
```

---

## Visual Design

### Table Column Order
| Icon | Name (EN) | Name (FA) | Slug | Status | **Navigation** | Actions |

### Navigation Badges

| Value | Label | Background | Text |
|-------|-------|------------|------|
| default | Default | #f3f4f6 | #374151 |
| toc-left | Sidebar Left | #dbeafe | #1e40af |
| toc-right | Sidebar Right | #e0e7ff | #3730a3 |
| progress-buttons | Top Tabs | #dcfce7 | #166534 |

### Edit Dialog Field Order
1. Name (EN)
2. Name (FA)
3. Slug (readonly for edit)
4. Description
5. Icon
6. Color
7. Status
8. Direction
9. **Navigation Style** ← NEW

---

## Testing Checklist

- [ ] Navigation column shows in table
- [ ] Correct badge colors for each type
- [ ] Edit dialog shows Navigation Style dropdown
- [ ] Current value pre-selected when editing
- [ ] Save updates navigation_type in database
- [ ] Changed forms show new navigation when opened
- [ ] Test all 4 navigation types work after update

---

## Files to Modify

| File | Action |
|------|--------|
| `backend/src/services/admin.service.ts` | Verify navigation_type in CRUD |
| `frontend/src/pages/admin/ManageFormsPage.tsx` | Add column, badge, dropdown |
| `frontend/src/services/adminApi.ts` | Verify Form interface |
