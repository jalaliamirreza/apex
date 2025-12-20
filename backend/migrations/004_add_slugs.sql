-- Migration 004: Add slugs and name_fa columns

-- Spaces
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;
ALTER TABLE spaces ADD COLUMN IF NOT EXISTS name_fa VARCHAR(255);

-- Pages  
ALTER TABLE pages ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
ALTER TABLE pages ADD COLUMN IF NOT EXISTS name_fa VARCHAR(255);

-- Sections
ALTER TABLE sections ADD COLUMN IF NOT EXISTS name_fa VARCHAR(255);

-- Update spaces with slugs
UPDATE spaces SET name_fa = name, name = 'Finance', slug = 'finance' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE spaces SET name_fa = name, name = 'Human Resources', slug = 'hr' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE spaces SET name_fa = name, name = 'Information Technology', slug = 'it' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE spaces SET name_fa = name, name = 'My Requests', slug = 'my-requests' WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE spaces SET name_fa = name, name = 'Administration', slug = 'admin' WHERE id = '55555555-5555-5555-5555-555555555555';

-- Update pages with slugs
UPDATE pages SET name_fa = name, name = 'Loans', slug = 'loans' WHERE id = 'aaaa1111-1111-1111-1111-111111111111';
UPDATE pages SET name_fa = name, name = 'Credits', slug = 'credits' WHERE id = 'aaaa2222-2222-2222-2222-222222222222';
UPDATE pages SET name_fa = name, name = 'Leaves', slug = 'leaves' WHERE id = 'bbbb1111-1111-1111-1111-111111111111';
UPDATE pages SET name_fa = name, name = 'Personnel Info', slug = 'personnel' WHERE id = 'bbbb2222-2222-2222-2222-222222222222';
UPDATE pages SET name_fa = name, name = 'IT Requests', slug = 'requests' WHERE id = 'cccc1111-1111-1111-1111-111111111111';
UPDATE pages SET name_fa = name, name = 'All Requests', slug = 'all' WHERE id = 'dddd1111-1111-1111-1111-111111111111';
UPDATE pages SET name_fa = name, name = 'Pending', slug = 'pending' WHERE id = 'dddd2222-2222-2222-2222-222222222222';
UPDATE pages SET name_fa = name, name = 'Approved', slug = 'approved' WHERE id = 'dddd3333-3333-3333-3333-333333333333';
UPDATE pages SET name_fa = name, name = 'System Management', slug = 'system' WHERE id = 'eeee1111-1111-1111-1111-111111111111';

-- Update sections
UPDATE sections SET name_fa = name, name = 'Personal Loans' WHERE id = 'sec11111-1111-1111-1111-111111111111';
UPDATE sections SET name_fa = name, name = 'Organizational Loans' WHERE id = 'sec22222-2222-2222-2222-222222222222';
UPDATE sections SET name_fa = name, name = 'Leave Types' WHERE id = 'sec33333-3333-3333-3333-333333333333';
UPDATE sections SET name_fa = name, name = 'Information Forms' WHERE id = 'sec44444-4444-4444-4444-444444444444';
UPDATE sections SET name_fa = name, name = 'Equipment Requests' WHERE id = 'sec55555-5555-5555-5555-555555555555';
UPDATE sections SET name_fa = name, name = 'Management Tools' WHERE id = '66666666-6666-6666-6666-666666666666';

-- Update tiles
UPDATE tiles SET name_fa = name, name = 'Manage Spaces' WHERE slug = 'manage-spaces';
UPDATE tiles SET name_fa = name, name = 'Manage Pages' WHERE slug = 'manage-pages';
UPDATE tiles SET name_fa = name, name = 'Manage Sections' WHERE slug = 'manage-sections';
UPDATE tiles SET name_fa = name, name = 'Manage Tiles' WHERE slug = 'manage-tiles';
