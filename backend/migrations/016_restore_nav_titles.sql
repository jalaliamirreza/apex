-- Restore navigation titles to nav-test-toc-sidebar
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

-- Verify
SELECT slug, schema->'pages'->0->>'navigationTitle' as page1_nav FROM forms WHERE slug = 'nav-test-toc-sidebar';
