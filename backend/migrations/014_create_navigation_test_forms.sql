-- Migration 014: Create navigation comparison forms
-- Copy comprehensive form twice with different navigation styles

-- Form 1: TOC Sidebar Navigation (Left)
INSERT INTO forms (id, slug, name, name_fa, description, icon, color, direction, status, schema)
SELECT 
  'a1b2c3d4-e5f6-4a5b-8c9d-000000000001',
  'nav-test-toc-sidebar',
  'Navigation Test: TOC Sidebar',
  'تست ناوبری: نوار کناری',
  'Testing left sidebar Table of Contents navigation',
  'navigation-right-arrow',
  '#6366f1',
  'ltr',
  'active',
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
  'a1b2c3d4-e5f6-4a5b-8c9d-000000000002',
  'nav-test-progress-buttons',
  'Navigation Test: Progress Buttons',
  'تست ناوبری: دکمه‌های پیشرفت',
  'Testing top progress bar with clickable buttons',
  'navigation-up-arrow',
  '#8b5cf6',
  'ltr',
  'active',
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

-- Add navigationTitle to each page for Form 1 (TOC Sidebar)
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

-- Add navigationTitle to each page for Form 2 (Progress Buttons)
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
  'b1c2d3e4-f5a6-4b5c-9d0e-000000000001',
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
  'a1b2c3d4-e5f6-4a5b-8c9d-000000000001'
FROM sections s
JOIN pages p ON s.page_id = p.id
JOIN spaces sp ON p.space_id = sp.id
WHERE sp.slug = 'it' AND p.slug = 'requests'
LIMIT 1;

INSERT INTO tiles (id, section_id, name, name_fa, slug, description, icon, color, type, order_index, direction, config, is_active, form_id)
SELECT 
  'b1c2d3e4-f5a6-4b5c-9d0e-000000000002',
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
  'a1b2c3d4-e5f6-4a5b-8c9d-000000000002'
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
