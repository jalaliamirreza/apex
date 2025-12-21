-- Remove all isRequired from test form
UPDATE forms 
SET schema = regexp_replace(schema::text, '"isRequired": true', '"isRequired": false', 'g')::jsonb 
WHERE slug = 'comprehensive-surveyjs-test';

SELECT 'Updated' as status, slug FROM forms WHERE slug = 'comprehensive-surveyjs-test';
