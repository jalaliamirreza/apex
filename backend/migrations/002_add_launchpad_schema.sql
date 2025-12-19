-- Migration: Add Launchpad Schema (Spaces, Pages, Sections)
-- Date: 2025-12-19
-- Purpose: Create SAP Fiori Launchpad structure for user portal

-- Spaces (Top level navigation tabs)
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  icon VARCHAR(50) DEFAULT 'folder',
  color VARCHAR(20) DEFAULT '#0a6ed1',
  order_index INT DEFAULT 0,
  direction VARCHAR(3) DEFAULT 'rtl',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pages (Under each space, shown in dropdown)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  icon VARCHAR(50) DEFAULT 'document',
  order_index INT DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sections (Groups of tiles on a page)
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Update forms table to link to sections
ALTER TABLE forms ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id);
ALTER TABLE forms ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'document';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#0a6ed1';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pages_space_id ON pages(space_id);
CREATE INDEX IF NOT EXISTS idx_sections_page_id ON sections(page_id);
CREATE INDEX IF NOT EXISTS idx_forms_section_id ON forms(section_id);

-- Insert sample Spaces
INSERT INTO spaces (id, name, name_en, icon, order_index, direction) VALUES
  ('11111111-1111-1111-1111-111111111111', 'مالی و اعتبارات', 'Finance & Credit', 'money-bills', 1, 'rtl'),
  ('22222222-2222-2222-2222-222222222222', 'منابع انسانی', 'Human Resources', 'employee', 2, 'rtl'),
  ('33333333-3333-3333-3333-333333333333', 'فناوری اطلاعات', 'Information Technology', 'it-host', 3, 'rtl'),
  ('44444444-4444-4444-4444-444444444444', 'درخواست‌های من', 'My Requests', 'outbox', 4, 'rtl')
ON CONFLICT (id) DO NOTHING;

-- Insert Pages for "مالی و اعتبارات"
INSERT INTO pages (id, space_id, name, name_en, icon, order_index, is_default) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'وام‌ها', 'Loans', 'loan', 1, true),
  ('aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'اعتبارات', 'Credits', 'credit-card', 2, false)
ON CONFLICT (id) DO NOTHING;

-- Insert Pages for "منابع انسانی"
INSERT INTO pages (id, space_id, name, name_en, icon, order_index, is_default) VALUES
  ('bbbb1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'مرخصی‌ها', 'Leaves', 'calendar', 1, true),
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'اطلاعات پرسنلی', 'Personnel Info', 'person-placeholder', 2, false)
ON CONFLICT (id) DO NOTHING;

-- Insert Pages for "فناوری اطلاعات"
INSERT INTO pages (id, space_id, name, name_en, icon, order_index, is_default) VALUES
  ('cccc1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'درخواست‌های IT', 'IT Requests', 'technical-object', 1, true)
ON CONFLICT (id) DO NOTHING;

-- Insert Pages for "درخواست‌های من"
INSERT INTO pages (id, space_id, name, name_en, icon, order_index, is_default) VALUES
  ('dddd1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'همه درخواست‌ها', 'All Requests', 'list', 1, true),
  ('dddd2222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'در انتظار تایید', 'Pending', 'pending', 2, false),
  ('dddd3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'تایید شده', 'Approved', 'accept', 3, false)
ON CONFLICT (id) DO NOTHING;

-- Insert Sections for "وام‌ها" page
INSERT INTO sections (id, page_id, name, name_en, order_index) VALUES
  ('sec11111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'وام‌های شخصی', 'Personal Loans', 1),
  ('sec22222-2222-2222-2222-222222222222', 'aaaa1111-1111-1111-1111-111111111111', 'وام‌های سازمانی', 'Organizational Loans', 2)
ON CONFLICT (id) DO NOTHING;

-- Insert Sections for "مرخصی‌ها" page
INSERT INTO sections (id, page_id, name, name_en, order_index) VALUES
  ('sec33333-3333-3333-3333-333333333333', 'bbbb1111-1111-1111-1111-111111111111', 'انواع مرخصی', 'Leave Types', 1)
ON CONFLICT (id) DO NOTHING;

-- Insert Sections for "اطلاعات پرسنلی" page
INSERT INTO sections (id, page_id, name, name_en, order_index) VALUES
  ('sec44444-4444-4444-4444-444444444444', 'bbbb2222-2222-2222-2222-222222222222', 'فرم‌های اطلاعاتی', 'Information Forms', 1)
ON CONFLICT (id) DO NOTHING;

-- Insert Sections for "درخواست‌های IT" page
INSERT INTO sections (id, page_id, name, name_en, order_index) VALUES
  ('sec55555-5555-5555-5555-555555555555', 'cccc1111-1111-1111-1111-111111111111', 'درخواست تجهیزات', 'Equipment Requests', 1)
ON CONFLICT (id) DO NOTHING;
