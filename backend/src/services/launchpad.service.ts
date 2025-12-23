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
          'name_fa', p.name_fa,
          'slug', p.slug,
          'icon', p.icon,
          'order_index', p.order_index,
          'is_default', p.is_default
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
    name_fa: row.name_fa,
    slug: row.slug,
    icon: row.icon,
    color: row.color,
    order_index: row.order_index,
    direction: row.direction,
    is_active: row.is_active,
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

// Get page content - ONLY from tiles table
export async function getPageContent(pageId: string): Promise<Page | null> {
  // Get page
  const pageResult = await query(
    'SELECT * FROM pages WHERE id = $1 AND is_active = true',
    [pageId]
  );

  if (pageResult.rows.length === 0) return null;
  const page = pageResult.rows[0];

  // Get sections with tiles (join form data when type='form')
  const sectionsResult = await query(`
    SELECT sec.*,
      COALESCE((
        SELECT json_agg(
          json_build_object(
            'id', t.id,
            'name', t.name,
            'name_fa', t.name_fa,
            'description', t.description,
            'icon', COALESCE(t.icon, 'document'),
            'color', COALESCE(t.color, '#0a6ed1'),
            'slug', CASE WHEN t.type = 'form' AND f.slug IS NOT NULL THEN f.slug ELSE t.slug END,
            'type', t.type,
            'order_index', COALESCE(t.order_index, 0),
            'direction', t.direction,
            'config', t.config,
            'form_id', t.form_id
          ) ORDER BY t.order_index
        )
        FROM tiles t
        LEFT JOIN forms f ON t.form_id = f.id
        WHERE t.section_id = sec.id AND t.is_active = true
      ), '[]') as tiles
    FROM sections sec
    WHERE sec.page_id = $1 AND sec.is_active = true
    ORDER BY sec.order_index
  `, [pageId]);

  return {
    id: page.id,
    space_id: page.space_id,
    name: page.name,
    name_fa: page.name_fa,
    slug: page.slug,
    icon: page.icon,
    order_index: page.order_index,
    is_default: page.is_default,
    is_active: page.is_active,
    sections: sectionsResult.rows.map((row: any) => ({
      id: row.id,
      page_id: row.page_id,
      name: row.name,
      name_fa: row.name_fa,
      order_index: row.order_index,
      is_active: row.is_active,
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
