-- Migration: Add Admin App (Tiles Table and Admin Space)
-- Date: 2025-12-20
-- Purpose: Create tiles table and add admin space with management tiles

-- Tiles (Individual app tiles on a page)
CREATE TABLE IF NOT EXISTS tiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description TEXT,
  icon VARCHAR(50) DEFAULT 'document',
  color VARCHAR(20) DEFAULT '#0a6ed1',
  slug VARCHAR(255) NOT NULL,
  type VARCHAR(20) DEFAULT 'form',
  order_index INT DEFAULT 0,
  direction VARCHAR(3) DEFAULT 'rtl',
  config JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tiles_section_id ON tiles(section_id);
CREATE INDEX IF NOT EXISTS idx_tiles_slug ON tiles(slug);

-- Insert Admin Space
INSERT INTO spaces (id, name, name_en, icon, color, order_index, direction) VALUES
  ('55555555-5555-5555-5555-555555555555', 'مدیریت', 'Administration', 'settings', '#6366f1', 0, 'rtl')
ON CONFLICT (id) DO NOTHING;

-- Insert Admin Page
INSERT INTO pages (id, space_id, name, name_en, icon, order_index, is_default) VALUES
  ('eeee1111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'مدیریت سیستم', 'System Management', 'admin-settings', 1, true)
ON CONFLICT (id) DO NOTHING;

-- Insert Admin Section
INSERT INTO sections (id, page_id, name, name_en, order_index) VALUES
  ('sec66666-6666-6666-6666-666666666666', 'eeee1111-1111-1111-1111-111111111111', 'ابزارهای مدیریتی', 'Management Tools', 1)
ON CONFLICT (id) DO NOTHING;

-- Insert Admin Tiles
INSERT INTO tiles (id, section_id, name, name_en, description, icon, color, slug, type, order_index, config) VALUES
  (
    'tile1111-1111-1111-1111-111111111111',
    'sec66666-6666-6666-6666-666666666666',
    'مدیریت فضاها',
    'Manage Spaces',
    'Create, edit, and organize spaces',
    'org-chart',
    '#6366f1',
    'manage-spaces',
    'app',
    1,
    '{"route": "/app/manage-spaces", "permissions": ["admin.spaces.manage"]}'::jsonb
  ),
  (
    'tile2222-2222-2222-2222-222222222222',
    'sec66666-6666-6666-6666-666666666666',
    'مدیریت صفحات',
    'Manage Pages',
    'Create, edit, and organize pages within spaces',
    'copy',
    '#8b5cf6',
    'manage-pages',
    'app',
    2,
    '{"route": "/app/manage-pages", "permissions": ["admin.pages.manage"]}'::jsonb
  ),
  (
    'tile3333-3333-3333-3333-333333333333',
    'sec66666-6666-6666-6666-666666666666',
    'مدیریت بخش‌ها',
    'Manage Sections',
    'Create, edit, and organize sections within pages',
    'grid',
    '#ec4899',
    'manage-sections',
    'app',
    3,
    '{"route": "/app/manage-sections", "permissions": ["admin.sections.manage"]}'::jsonb
  ),
  (
    'tile4444-4444-4444-4444-444444444444',
    'sec66666-6666-6666-6666-666666666666',
    'مدیریت تایل‌ها',
    'Manage Tiles',
    'Create, edit, and configure application tiles',
    'product',
    '#f59e0b',
    'manage-tiles',
    'app',
    4,
    '{"route": "/app/manage-tiles", "permissions": ["admin.tiles.manage"]}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
