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
