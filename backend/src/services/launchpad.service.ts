import { query } from '../config/database';
import { Space, Page, Section, Tile } from '../models/launchpad.model';

// Get all spaces with pages (for navigation)
export async function getSpaces(): Promise<Space[]> {
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
export async function getPageContent(pageId: string): Promise<Page | null> {
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

// Get default page for a space (legacy - keep for compatibility)
export async function getDefaultPage(spaceId: string): Promise<string | null> {
  const result = await query(
    'SELECT id FROM pages WHERE space_id = $1 AND is_default = true AND is_active = true LIMIT 1',
    [spaceId]
  );
  return result.rows[0]?.id || null;
}
