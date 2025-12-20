-- Migration 003: Create tiles table
-- Already created manually, this ensures it exists

CREATE TABLE IF NOT EXISTS tiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  name_fa VARCHAR(255),
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

CREATE INDEX IF NOT EXISTS idx_tiles_section_id ON tiles(section_id);
CREATE INDEX IF NOT EXISTS idx_tiles_slug ON tiles(slug);
