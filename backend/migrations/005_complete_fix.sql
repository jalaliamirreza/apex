-- Migration 005: Complete Schema Fix
-- Date: 2025-12-20
-- Purpose: Ensure all required columns and data exist correctly

-- ============================================
-- ENSURE COLUMNS EXIST
-- ============================================

-- Spaces
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS name_fa VARCHAR(255);

-- Pages
ALTER TABLE pages ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
ALTER TABLE pages ADD COLUMN IF NOT EXISTS name_fa VARCHAR(255);

-- Sections
ALTER TABLE sections ADD COLUMN IF NOT EXISTS name_fa VARCHAR(255);

-- Tiles
ALTER TABLE tiles ADD COLUMN IF NOT EXISTS name_fa VARCHAR(255);
ALTER TABLE tiles ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Forms
ALTER TABLE forms ADD COLUMN IF NOT EXISTS name_fa VARCHAR(255);
ALTER TABLE forms ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- ============================================
-- FIX SPACES DATA
-- ============================================

-- Update existing spaces with slugs and copy Persian names
UPDATE spaces SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'finance'),
  name = 'Finance'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE spaces SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'hr'),
  name = 'Human Resources'
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE spaces SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'it'),
  name = 'Information Technology'
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE spaces SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'my-requests'),
  name = 'My Requests'
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE spaces SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'admin'),
  name = 'Administration'
WHERE id = '55555555-5555-5555-5555-555555555555';

-- ============================================
-- FIX PAGES DATA
-- ============================================

-- Finance pages
UPDATE pages SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'loans'),
  name = 'Loans'
WHERE id = 'aaaa1111-1111-1111-1111-111111111111';

UPDATE pages SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'credits'),
  name = 'Credits'
WHERE id = 'aaaa2222-2222-2222-2222-222222222222';

-- HR pages
UPDATE pages SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'leaves'),
  name = 'Leaves'
WHERE id = 'bbbb1111-1111-1111-1111-111111111111';

UPDATE pages SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'personnel'),
  name = 'Personnel Info'
WHERE id = 'bbbb2222-2222-2222-2222-222222222222';

-- IT pages
UPDATE pages SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'requests'),
  name = 'IT Requests'
WHERE id = 'cccc1111-1111-1111-1111-111111111111';

-- My Requests pages
UPDATE pages SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'all'),
  name = 'All Requests'
WHERE id = 'dddd1111-1111-1111-1111-111111111111';

UPDATE pages SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'pending'),
  name = 'Pending'
WHERE id = 'dddd2222-2222-2222-2222-222222222222';

UPDATE pages SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'approved'),
  name = 'Approved'
WHERE id = 'dddd3333-3333-3333-3333-333333333333';

-- Admin pages
UPDATE pages SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, 'system'),
  name = 'System Management'
WHERE id = 'eeee1111-1111-1111-1111-111111111111';

-- ============================================
-- FIX SECTIONS DATA
-- ============================================

UPDATE sections SET name_fa = COALESCE(name_fa, name), name = 'Personal Loans'
WHERE id = 'sec11111-1111-1111-1111-111111111111';

UPDATE sections SET name_fa = COALESCE(name_fa, name), name = 'Organizational Loans'
WHERE id = 'sec22222-2222-2222-2222-222222222222';

UPDATE sections SET name_fa = COALESCE(name_fa, name), name = 'Leave Types'
WHERE id = 'sec33333-3333-3333-3333-333333333333';

UPDATE sections SET name_fa = COALESCE(name_fa, name), name = 'Information Forms'
WHERE id = 'sec44444-4444-4444-4444-444444444444';

UPDATE sections SET name_fa = COALESCE(name_fa, name), name = 'Equipment Requests'
WHERE id = 'sec55555-5555-5555-5555-555555555555';

UPDATE sections SET name_fa = COALESCE(name_fa, name), name = 'Management Tools'
WHERE id = 'sec66666-6666-6666-6666-666666666666';

-- ============================================
-- FIX TILES DATA
-- ============================================

UPDATE tiles SET name_fa = COALESCE(name_fa, name), name = 'Manage Spaces'
WHERE slug = 'manage-spaces';

UPDATE tiles SET name_fa = COALESCE(name_fa, name), name = 'Manage Pages'
WHERE slug = 'manage-pages';

UPDATE tiles SET name_fa = COALESCE(name_fa, name), name = 'Manage Sections'
WHERE slug = 'manage-sections';

UPDATE tiles SET name_fa = COALESCE(name_fa, name), name = 'Manage Tiles'
WHERE slug = 'manage-tiles';

-- ============================================
-- FIX FORMS - Add slugs from form name
-- ============================================

UPDATE forms SET 
  name_fa = COALESCE(name_fa, name),
  slug = COALESCE(slug, LOWER(REPLACE(REPLACE(name, ' ', '-'), '.', '')))
WHERE slug IS NULL;

-- ============================================
-- CREATE INDEXES IF NOT EXIST
-- ============================================

CREATE INDEX IF NOT EXISTS idx_spaces_slug ON spaces(slug);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_tiles_slug ON tiles(slug);
CREATE INDEX IF NOT EXISTS idx_forms_slug ON forms(slug);
