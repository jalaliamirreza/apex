-- Migration 017: Clean navigation settings from form schemas
-- Navigation is now controlled by navigation_type column, not schema

-- Remove navigation settings from all form schemas
UPDATE forms 
SET schema = schema - 'showTOC' - 'tocLocation' - 'showProgressBar' - 'progressBarType'
WHERE schema ?| array['showTOC', 'tocLocation', 'showProgressBar', 'progressBarType'];

-- Verify
SELECT slug, navigation_type,
       schema ? 'showTOC' as has_toc,
       schema ? 'showProgressBar' as has_progress
FROM forms 
ORDER BY slug;
