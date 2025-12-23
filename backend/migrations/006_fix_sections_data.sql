-- Migration 006: Fix Sections Data
-- Date: 2025-12-20
-- Purpose: Move Persian from name to name_fa, English from name_en to name

-- Fix sections where name has Persian and name_fa is NULL
UPDATE sections
SET
  name_fa = name,
  name = name_en
WHERE name_fa IS NULL AND name_en IS NOT NULL;

-- Verify the fix
-- SELECT id, name, name_fa, name_en FROM sections;
