# Phase 10.1 - Fix Database Schema & URL Slugs

## Overview
1. Use English for key columns
2. Add Persian columns separately (name_fa)
3. Use slugs in URLs instead of UUIDs
4. Fix backend to query both forms AND tiles

---

## 1. Database Migration (004_fix_schema_slugs.sql)

```sql
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
UPDATE sections SET name = 'Management Tools' WHERE id = '66666666-6666-6666-6666-666666666666';

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
```

---

## 2. Backend Changes

### 2.1 Update launchpad.service.ts

**File:** `backend/src/services/launchpad.service.ts`

```typescript
import { query } from '../config/database';

// Get all spaces with pages (for navigation)
export async function getSpaces() {
  const result = await query(`
    SELECT s.*,
      COALESCE(json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'nameFa', p.name_fa,
          'slug', p.slug,
          'icon', p.icon,
          'orderIndex', p.order_index,
          'isDefault', p.is_default
        ) ORDER BY p.order_index
      ) FILTER (WHERE p.id IS NOT NULL), '[]') as pages
    FROM spaces s
    LEFT JOIN pages p ON p.space_id = s.id AND p.is_active = true
    WHERE s.is_active = true
    GROUP BY s.id
    ORDER BY s.order_index
  `);

  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    nameFa: row.name_fa,
    slug: row.slug,
    icon: row.icon,
    color: row.color,
    orderIndex: row.order_index,
    direction: row.direction,
    isActive: row.is_active,
    pages: row.pages
  }));
}

// Get space by slug
export async function getSpaceBySlug(slug: string) {
  const result = await query(
    'SELECT * FROM spaces WHERE slug = $1 AND is_active = true',
    [slug]
  );
  return result.rows[0] || null;
}

// Get page by space slug and page slug
export async function getPageBySlug(spaceSlug: string, pageSlug: string) {
  const result = await query(`
    SELECT p.* FROM pages p
    JOIN spaces s ON s.id = p.space_id
    WHERE s.slug = $1 AND p.slug = $2 AND p.is_active = true
  `, [spaceSlug, pageSlug]);
  return result.rows[0] || null;
}

// Get page content with sections and tiles (FORMS + TILES)
export async function getPageContent(pageId: string) {
  // Get page
  const pageResult = await query(
    'SELECT * FROM pages WHERE id = $1 AND is_active = true',
    [pageId]
  );

  if (pageResult.rows.length === 0) return null;
  const page = pageResult.rows[0];

  // Get sections with BOTH forms AND tiles
  const sectionsResult = await query(`
    SELECT sec.*,
      COALESCE((
        SELECT json_agg(t ORDER BY t.order_index)
        FROM (
          -- Forms
          SELECT 
            f.id,
            f.name,
            f.name_fa as "nameFa",
            f.description,
            COALESCE(f.icon, 'document') as icon,
            COALESCE(f.color, '#0a6ed1') as color,
            f.slug,
            'form' as type,
            COALESCE(f.order_index, 0) as order_index,
            f.direction,
            NULL as config
          FROM forms f
          WHERE f.section_id = sec.id AND f.status = 'active'
          
          UNION ALL
          
          -- Tiles
          SELECT 
            t.id,
            t.name,
            t.name_fa as "nameFa",
            t.description,
            COALESCE(t.icon, 'document') as icon,
            COALESCE(t.color, '#0a6ed1') as color,
            t.slug,
            t.type,
            COALESCE(t.order_index, 0) as order_index,
            t.direction,
            t.config
          FROM tiles t
          WHERE t.section_id = sec.id AND t.is_active = true
        ) t
      ), '[]') as tiles
    FROM sections sec
    WHERE sec.page_id = $1 AND sec.is_active = true
    ORDER BY sec.order_index
  `, [pageId]);

  return {
    id: page.id,
    spaceId: page.space_id,
    name: page.name,
    nameFa: page.name_fa,
    slug: page.slug,
    icon: page.icon,
    orderIndex: page.order_index,
    isDefault: page.is_default,
    isActive: page.is_active,
    sections: sectionsResult.rows.map((row: any) => ({
      id: row.id,
      pageId: row.page_id,
      name: row.name,
      nameFa: row.name_fa,
      orderIndex: row.order_index,
      isActive: row.is_active,
      tiles: row.tiles
    }))
  };
}

// Get default page slug for a space
export async function getDefaultPageSlug(spaceSlug: string) {
  const result = await query(`
    SELECT p.slug FROM pages p
    JOIN spaces s ON s.id = p.space_id
    WHERE s.slug = $1 AND p.is_default = true AND p.is_active = true
    LIMIT 1
  `, [spaceSlug]);
  return result.rows[0]?.slug || null;
}
```

### 2.2 Update launchpad.routes.ts

**File:** `backend/src/routes/launchpad.routes.ts`

Add new routes for slug-based lookups:

```typescript
// Get space by slug
router.get('/spaces/by-slug/:slug', async (req, res) => {
  const space = await launchpadService.getSpaceBySlug(req.params.slug);
  if (!space) return res.status(404).json({ error: 'Space not found' });
  res.json(space);
});

// Get page by slugs
router.get('/pages/by-slug/:spaceSlug/:pageSlug', async (req, res) => {
  const page = await launchpadService.getPageBySlug(req.params.spaceSlug, req.params.pageSlug);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  res.json(page);
});

// Get page content by slugs
router.get('/pages/by-slug/:spaceSlug/:pageSlug/content', async (req, res) => {
  const page = await launchpadService.getPageBySlug(req.params.spaceSlug, req.params.pageSlug);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  const content = await launchpadService.getPageContent(page.id);
  res.json(content);
});

// Get default page slug for space
router.get('/spaces/:slug/default-page', async (req, res) => {
  const pageSlug = await launchpadService.getDefaultPageSlug(req.params.slug);
  res.json({ slug: pageSlug });
});
```

---

## 3. Frontend Changes

### 3.1 Update types/launchpad.ts

```typescript
export interface Space {
  id: string;
  name: string;        // English
  nameFa?: string;     // Persian
  slug: string;        // URL slug
  icon: string;
  color: string;
  orderIndex: number;
  direction: 'ltr' | 'rtl';
  isActive: boolean;
  pages: Page[];
}

export interface Page {
  id: string;
  spaceId: string;
  name: string;        // English
  nameFa?: string;     // Persian
  slug: string;        // URL slug
  icon: string;
  orderIndex: number;
  isDefault: boolean;
  isActive: boolean;
  sections?: Section[];
}

export interface Section {
  id: string;
  pageId: string;
  name: string;        // English
  nameFa?: string;     // Persian
  orderIndex: number;
  isActive: boolean;
  tiles: Tile[];
}

export interface Tile {
  id: string;
  name: string;        // English
  nameFa?: string;     // Persian
  description?: string;
  icon: string;
  color: string;
  slug: string;
  type: 'form' | 'link' | 'kpi' | 'app';
  orderIndex: number;
  direction?: 'ltr' | 'rtl';
  config?: Record<string, any>;
}
```

### 3.2 Update LaunchpadPage.tsx

Change URL structure from UUID to slug:

```typescript
// OLD:
const { spaceId, pageId } = useParams();
navigate(`/launchpad/${space.id}/${page.id}`);

// NEW:
const { spaceSlug, pageSlug } = useParams();
navigate(`/launchpad/${space.slug}/${page.slug}`);
```

**Display Persian names in UI:**
```typescript
// Show Persian name if available, fallback to English
{space.nameFa || space.name}
```

### 3.3 Update App.tsx routes

```typescript
// OLD:
<Route path="/launchpad/:spaceId/:pageId" element={<LaunchpadPage />} />

// NEW:
<Route path="/launchpad/:spaceSlug/:pageSlug" element={<LaunchpadPage />} />
```

### 3.4 Update API service

```typescript
// NEW functions in services/api.ts

export const launchpadApi = {
  getSpaces: () => fetch('/api/launchpad/spaces').then(r => r.json()),
  
  getPageContentBySlug: (spaceSlug: string, pageSlug: string) =>
    fetch(`/api/launchpad/pages/by-slug/${spaceSlug}/${pageSlug}/content`).then(r => r.json()),
  
  getDefaultPageSlug: (spaceSlug: string) =>
    fetch(`/api/launchpad/spaces/${spaceSlug}/default-page`).then(r => r.json()),
};
```

---

## 4. New URL Structure

| Old URL | New URL |
|---------|---------|
| `/launchpad/11111111-.../aaaa1111-...` | `/launchpad/finance/loans` |
| `/launchpad/55555555-.../eeee1111-...` | `/launchpad/admin/system` |
| `/launchpad/22222222-.../bbbb1111-...` | `/launchpad/hr/leaves` |

---

## Summary

| Change | Description |
|--------|-------------|
| `name` column | English only |
| `name_fa` column | Persian (new) |
| `slug` column | URL-friendly identifier (new) |
| URLs | Use slugs instead of UUIDs |
| Backend | Query both forms AND tiles |
| Frontend | Display nameFa, navigate with slugs |
