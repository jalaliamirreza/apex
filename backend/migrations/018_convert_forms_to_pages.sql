-- Migration 018: Convert single-page forms to pages structure
-- All forms will now use { "pages": [...] } format for consistency

-- Convert forms with elements at root to pages structure
UPDATE forms 
SET schema = jsonb_build_object(
  'pages', jsonb_build_array(
    jsonb_build_object(
      'name', 'page1',
      'title', 'Page 1',
      'elements', schema->'elements'
    )
  )
)
WHERE schema ? 'elements' 
  AND NOT schema ? 'pages';

-- Verify: all forms should now have pages array
SELECT slug, 
       schema ? 'pages' as has_pages,
       schema ? 'elements' as has_root_elements,
       jsonb_array_length(schema->'pages') as page_count
FROM forms
ORDER BY slug;
