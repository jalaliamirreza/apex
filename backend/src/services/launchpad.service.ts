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
          'nameEn', p.name_en,
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
    nameEn: row.name_en,
    icon: row.icon,
    color: row.color,
    orderIndex: row.order_index,
    direction: row.direction,
    isActive: row.is_active,
    pages: row.pages
  }));
}

// Get page content with sections and tiles
export async function getPageContent(pageId: string): Promise<Page | null> {
  // Get page
  const pageResult = await query(
    'SELECT * FROM pages WHERE id = $1 AND is_active = true',
    [pageId]
  );

  if (pageResult.rows.length === 0) return null;

  const page = pageResult.rows[0];

  // Get sections with tiles (forms)
  const sectionsResult = await query(`
    SELECT sec.*,
      COALESCE(json_agg(
        json_build_object(
          'id', f.id,
          'name', f.name,
          'description', f.description,
          'icon', COALESCE(f.icon, 'document'),
          'color', COALESCE(f.color, '#0a6ed1'),
          'slug', f.slug,
          'type', 'form',
          'orderIndex', COALESCE(f.order_index, 0),
          'direction', f.direction
        ) ORDER BY f.order_index
      ) FILTER (WHERE f.id IS NOT NULL), '[]') as tiles
    FROM sections sec
    LEFT JOIN forms f ON f.section_id = sec.id AND f.status = 'active'
    WHERE sec.page_id = $1 AND sec.is_active = true
    GROUP BY sec.id
    ORDER BY sec.order_index
  `, [pageId]);

  return {
    id: page.id,
    spaceId: page.space_id,
    name: page.name,
    nameEn: page.name_en,
    icon: page.icon,
    orderIndex: page.order_index,
    isDefault: page.is_default,
    isActive: page.is_active,
    sections: sectionsResult.rows.map((row: any) => ({
      id: row.id,
      pageId: row.page_id,
      name: row.name,
      nameEn: row.name_en,
      orderIndex: row.order_index,
      isActive: row.is_active,
      tiles: row.tiles
    }))
  };
}

// Get default page for a space
export async function getDefaultPage(spaceId: string): Promise<string | null> {
  const result = await query(
    'SELECT id FROM pages WHERE space_id = $1 AND is_default = true AND is_active = true LIMIT 1',
    [spaceId]
  );
  return result.rows[0]?.id || null;
}
