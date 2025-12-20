-- Migration: Fix Schema - English names, Slugs, Persian columns
-- Date: 2025-12-20

-- ============================================
-- SPACES TABLE
-- ============================================

-- Add slug column
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Rename name to name_fa, add English name
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS name_fa VARCHAR(255);

-- Update existing data - move Persian to name_fa, set English name
UPDATE spaces SET name_fa = name WHERE name_fa IS NULL;
UPDATE spaces SET
  name = 'Finance',
  slug = 'finance'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE spaces SET
  name = 'Human Resources',
  slug = 'hr'
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE spaces SET
  name = 'Information Technology',
  slug = 'it'
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE spaces SET
  name = 'My Requests',
  slug = 'my-requests'
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE spaces SET
  name = 'Administration',
  slug = 'admin'
WHERE id = '55555555-5555-5555-5555-555555555555';

-- ============================================
-- PAGES TABLE
-- ============================================

-- Add slug column
ALTER TABLE pages ADD COLUMN IF NOT EXISTS slug VARCHAR(100);

-- Add unique constraint on space_id + slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_space_slug ON pages(space_id, slug);

-- Rename name to name_fa, add English name
ALTER TABLE pages ADD COLUMN IF NOT EXISTS name_fa VARCHAR(255);

-- Update existing pages
UPDATE pages SET name_fa = name WHERE name_fa IS NULL;

-- Finance pages
UPDATE pages SET name = 'Loans', slug = 'loans'
WHERE id = 'aaaa1111-1111-1111-1111-111111111111';
UPDATE pages SET name = 'Credits', slug = 'credits'
WHERE id = 'aaaa2222-2222-2222-2222-222222222222';

-- HR pages
UPDATE pages SET name = 'Leaves', slug = 'leaves'
WHERE id = 'bbbb1111-1111-1111-1111-111111111111';
UPDATE pages SET name = 'Personnel Info', slug = 'personnel'
WHERE id = 'bbbb2222-2222-2222-2222-222222222222';

-- IT pages
UPDATE pages SET name = 'IT Requests', slug = 'requests'
WHERE id = 'cccc1111-1111-1111-1111-111111111111';

-- My Requests pages
UPDATE pages SET name = 'All Requests', slug = 'all'
WHERE id = 'dddd1111-1111-1111-1111-111111111111';
UPDATE pages SET name = 'Pending', slug = 'pending'
WHERE id = 'dddd2222-2222-2222-2222-222222222222';
UPDATE pages SET name = 'Approved', slug = 'approved'
WHERE id = 'dddd3333-3333-3333-3333-333333333333';

-- Admin pages
UPDATE pages SET name = 'System Management', slug = 'system'
WHERE id = 'eeee1111-1111-1111-1111-111111111111';

-- ============================================
-- SECTIONS TABLE
-- ============================================

ALTER TABLE sections ADD COLUMN IF NOT EXISTS name_fa VARCHAR(255);
UPDATE sections SET name_fa = name WHERE name_fa IS NULL;

-- Update section names to English
UPDATE sections SET name = 'Personal Loans' WHERE id = 'sec11111-1111-1111-1111-111111111111';
UPDATE sections SET name = 'Organizational Loans' WHERE id = 'sec22222-2222-2222-2222-222222222222';
UPDATE sections SET name = 'Leave Types' WHERE id = 'sec33333-3333-3333-3333-333333333333';
UPDATE sections SET name = 'Information Forms' WHERE id = 'sec44444-4444-4444-4444-444444444444';
UPDATE sections SET name = 'Equipment Requests' WHERE id = 'sec55555-5555-5555-5555-555555555555';
UPDATE sections SET name = 'Management Tools' WHERE id = 'sec66666-6666-6666-6666-666666666666';

-- ============================================
-- TILES TABLE
-- ============================================

ALTER TABLE tiles ADD COLUMN IF NOT EXISTS name_fa VARCHAR(255);
UPDATE tiles SET name_fa = name WHERE name_fa IS NULL;

-- Update tile names to English
UPDATE tiles SET name = 'Manage Spaces' WHERE slug = 'manage-spaces';
UPDATE tiles SET name = 'Manage Pages' WHERE slug = 'manage-pages';
UPDATE tiles SET name = 'Manage Sections' WHERE slug = 'manage-sections';
UPDATE tiles SET name = 'Manage Tiles' WHERE slug = 'manage-tiles';

-- ============================================
-- FORMS TABLE
-- ============================================

ALTER TABLE forms ADD COLUMN IF NOT EXISTS name_fa VARCHAR(255);
