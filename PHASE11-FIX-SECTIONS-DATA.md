# PHASE 11 FIX: Sections Table Data Migration

## Issue
The `sections` table has incorrect data:
- `name` column contains Persian text (should be English)
- `name_fa` column is NULL (should contain Persian text)
- `name_en` column has English text (legacy column, should be copied to `name`)

## File to Create
`backend/migrations/006_fix_sections_data.sql`

## SQL Migration

```sql
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
```

## Run Migration

```bash
docker exec -i apex-postgres psql -U apex -d apex < backend/migrations/006_fix_sections_data.sql
```

## Expected Result After Fix

| name (EN) | name_fa (FA) | name_en |
|-----------|--------------|---------|
| Personal Loans | وام‌های شخصی | Personal Loans |
| Organizational Loans | وام‌های سازمانی | Organizational Loans |
| Leave Types | انواع مرخصی | Leave Types |
| Information Forms | فرم‌های اطلاعاتی | Information Forms |
| Equipment Requests | درخواست تجهیزات | Equipment Requests |
| Management Tools | ابزارهای مدیریتی | Management Tools |

## Verify

```bash
docker exec apex-postgres psql -U apex -d apex -c "SELECT id, name, name_fa FROM sections;"
```
