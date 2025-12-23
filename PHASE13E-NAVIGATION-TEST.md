# PHASE 13E: Navigation Comparison Test

## Overview

Create two copies of the comprehensive test form to compare navigation options:
1. **TOC Sidebar** (left side navigation)
2. **Progress Buttons** (top clickable tabs)

---

## Part 1: Create Two Test Forms

### File: `backend/migrations/014_create_navigation_test_forms.sql`

```sql
-- Migration 014: Create navigation comparison forms
-- Copy comprehensive form twice with different navigation styles

-- Form 1: TOC Sidebar Navigation (Left)
INSERT INTO forms (id, slug, name, name_fa, description, icon, color, direction, status, schema)
SELECT 
  'nav-test-0001-0001-0001-000000000001',
  'nav-test-toc-sidebar',
  'Navigation Test: TOC Sidebar',
  'تست ناوبری: نوار کناری',
  'Testing left sidebar Table of Contents navigation',
  'navigation-right-arrow',
  '#6366f1',
  'ltr',
  'active',
  -- Modify schema to add TOC settings
  jsonb_set(
    jsonb_set(
      schema,
      '{showTOC}', 'true'
    ),
    '{tocLocation}', '"left"'
  )
FROM forms 
WHERE slug = 'comprehensive-surveyjs-test';

-- Form 2: Progress Bar Buttons Navigation (Top)
INSERT INTO forms (id, slug, name, name_fa, description, icon, color, direction, status, schema)
SELECT 
  'nav-test-0002-0002-0002-000000000002',
  'nav-test-progress-buttons',
  'Navigation Test: Progress Buttons',
  'تست ناوبری: دکمه‌های پیشرفت',
  'Testing top progress bar with clickable buttons',
  'navigation-up-arrow',
  '#8b5cf6',
  'ltr',
  'active',
  -- Modify schema to add progress buttons settings
  jsonb_set(
    jsonb_set(
      jsonb_set(
        schema,
        '{showProgressBar}', '"top"'
      ),
      '{progressBarType}', '"buttons"'
    ),
    '{showTOC}', 'false'
  )
FROM forms 
WHERE slug = 'comprehensive-surveyjs-test';

-- Add navigationTitle to each page for better display
-- Update Form 1 (TOC Sidebar)
UPDATE forms 
SET schema = jsonb_set(
  schema,
  '{pages}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN page->>'name' = 'page1' THEN jsonb_set(page, '{navigationTitle}', '"1. Personal Info"')
        WHEN page->>'name' = 'page2' THEN jsonb_set(page, '{navigationTitle}', '"2. Preferences"')
        WHEN page->>'name' = 'page3' THEN jsonb_set(page, '{navigationTitle}', '"3. Details"')
        WHEN page->>'name' = 'page4' THEN jsonb_set(page, '{navigationTitle}', '"4. Final"')
        ELSE page
      END
    )
    FROM jsonb_array_elements(schema->'pages') AS page
  )
)
WHERE slug = 'nav-test-toc-sidebar';

-- Update Form 2 (Progress Buttons)
UPDATE forms 
SET schema = jsonb_set(
  schema,
  '{pages}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN page->>'name' = 'page1' THEN jsonb_set(page, '{navigationTitle}', '"Personal Info"')
        WHEN page->>'name' = 'page2' THEN jsonb_set(page, '{navigationTitle}', '"Preferences"')
        WHEN page->>'name' = 'page3' THEN jsonb_set(page, '{navigationTitle}', '"Details"')
        WHEN page->>'name' = 'page4' THEN jsonb_set(page, '{navigationTitle}', '"Final"')
        ELSE page
      END
    )
    FROM jsonb_array_elements(schema->'pages') AS page
  )
)
WHERE slug = 'nav-test-progress-buttons';

-- Create tiles for both forms in IT section
INSERT INTO tiles (id, section_id, name, name_fa, slug, description, icon, color, type, order_index, direction, config, is_active, form_id)
SELECT 
  'nav-tile-0001-0001-0001-000000000001',
  s.id,
  'Nav Test: TOC Sidebar',
  'تست ناوبری: نوار کناری',
  'nav-test-toc-sidebar',
  'Left sidebar navigation test',
  'navigation-right-arrow',
  '#6366f1',
  'form',
  11,
  'ltr',
  '{}',
  true,
  'nav-test-0001-0001-0001-000000000001'
FROM sections s
JOIN pages p ON s.page_id = p.id
JOIN spaces sp ON p.space_id = sp.id
WHERE sp.slug = 'it' AND p.slug = 'requests'
LIMIT 1;

INSERT INTO tiles (id, section_id, name, name_fa, slug, description, icon, color, type, order_index, direction, config, is_active, form_id)
SELECT 
  'nav-tile-0002-0002-0002-000000000002',
  s.id,
  'Nav Test: Progress Buttons',
  'تست ناوبری: دکمه‌های پیشرفت',
  'nav-test-progress-buttons',
  'Top progress buttons navigation test',
  'navigation-up-arrow',
  '#8b5cf6',
  'form',
  12,
  'ltr',
  '{}',
  true,
  'nav-test-0002-0002-0002-000000000002'
FROM sections s
JOIN pages p ON s.page_id = p.id
JOIN spaces sp ON p.space_id = sp.id
WHERE sp.slug = 'it' AND p.slug = 'requests'
LIMIT 1;

-- Verify
SELECT 'Forms created:' as status;
SELECT slug, name, 
       schema->>'showTOC' as show_toc,
       schema->>'tocLocation' as toc_location,
       schema->>'progressBarType' as progress_type
FROM forms 
WHERE slug LIKE 'nav-test-%';

SELECT 'Tiles created:' as status;
SELECT name, slug, type FROM tiles WHERE slug LIKE 'nav-test-%';
```

---

## Part 2: Ensure SurveyFormRenderer Respects Schema Settings

The SurveyFormRenderer should NOT override these settings. Check that it doesn't set:
- `survey.showTOC = false`
- `survey.progressBarType = '...'`

These should come from the schema JSON.

### Verify in `frontend/src/components/SurveyFormRenderer.tsx`:

Make sure these lines are NOT present (or are commented out):
```typescript
// DO NOT set these - let schema control them
// survey.showTOC = false;
// survey.progressBarType = 'pages';
```

If any hardcoded navigation settings exist, remove them so the schema controls navigation.

---

## Implementation Steps

1. Create `backend/migrations/014_create_navigation_test_forms.sql`
2. Run the migration:
   ```bash
   docker exec -i apex-postgres psql -U apex -d apex < backend/migrations/014_create_navigation_test_forms.sql
   ```
3. Check `SurveyFormRenderer.tsx` - ensure no hardcoded navigation overrides
4. Test both forms:
   - http://localhost:3000/forms/nav-test-toc-sidebar
   - http://localhost:3000/forms/nav-test-progress-buttons

---

## Expected Results

### Form 1: TOC Sidebar
```
┌─────────────────┬────────────────────────────────────────┐
│ 1. Personal Info│                                        │
│ 2. Preferences  │     Form content                       │
│ 3. Details      │                                        │
│ 4. Final        │                                        │
└─────────────────┴────────────────────────────────────────┘
```
- Left sidebar with page list
- Click any page to jump directly
- Current page highlighted

### Form 2: Progress Buttons
```
┌──────────────────────────────────────────────────────────┐
│ [Personal Info] [Preferences] [Details] [Final]          │
├──────────────────────────────────────────────────────────┤
│                   Form content                           │
└──────────────────────────────────────────────────────────┘
```
- Top navigation bar with clickable buttons
- Each button = one page
- Current page button highlighted

---

## Test URLs

| Form | URL |
|------|-----|
| TOC Sidebar | http://localhost:3000/forms/nav-test-toc-sidebar |
| Progress Buttons | http://localhost:3000/forms/nav-test-progress-buttons |

---

## After Testing

User will compare both and decide which navigation style to use as default or make it configurable per form.
