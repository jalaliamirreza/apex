-- Migration 007: Refactor Forms-Tiles Relationship
-- Date: 2025-12-20
-- Purpose: Forms no longer appear directly on launchpad. Tiles link to forms.

-- Step 1: Add form_id column to tiles table
ALTER TABLE tiles ADD COLUMN IF NOT EXISTS form_id UUID REFERENCES forms(id) ON DELETE SET NULL;

-- Step 2: Create tiles for existing forms that have section_id
INSERT INTO tiles (section_id, name, name_fa, description, icon, color, slug, type, order_index, direction, form_id, is_active)
SELECT
  f.section_id,
  f.name,
  f.name_fa,
  f.description,
  COALESCE(f.icon, 'document'),
  COALESCE(f.color, '#0a6ed1'),
  f.slug,
  'form',
  COALESCE(f.order_index, 0),
  f.direction,
  f.id,
  true
FROM forms f
WHERE f.section_id IS NOT NULL
  AND f.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM tiles t WHERE t.form_id = f.id
  );

-- Step 3: Remove section_id from forms table (optional - keep for reference or drop)
-- For now, we keep it but stop using it
-- ALTER TABLE forms DROP COLUMN section_id;

-- Step 4: Create index on form_id
CREATE INDEX IF NOT EXISTS idx_tiles_form_id ON tiles(form_id);
