-- Migration: Add direction column to forms table
-- Date: 2025-12-19
-- Purpose: Support RTL/LTR text direction for forms

-- Add direction column with default 'ltr'
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS direction VARCHAR(3) DEFAULT 'ltr';

-- Update existing forms to have 'ltr' direction
UPDATE forms
SET direction = 'ltr'
WHERE direction IS NULL;

-- Add constraint to ensure only 'ltr' or 'rtl' values
ALTER TABLE forms
ADD CONSTRAINT direction_check CHECK (direction IN ('ltr', 'rtl'));
