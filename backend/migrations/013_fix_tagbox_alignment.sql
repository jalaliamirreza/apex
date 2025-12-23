-- Fix alignment: change description to placeholder for Areas of Interest
UPDATE forms 
SET schema = replace(schema::text, '"description": "Select multiple interests"', '"placeholder": "Select multiple interests"')::jsonb
WHERE slug = 'comprehensive-surveyjs-test';

SELECT 'Fixed' as status;
