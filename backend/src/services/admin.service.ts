import { query } from '../config/database';
import { Space, Page, Section, Tile } from '../models/launchpad.model';

// DTO types for create/update operations
export interface CreateSpaceDto {
  name: string;
  name_fa?: string;
  slug: string;
  icon: string;
  color: string;
  order_index: number;
  direction: 'ltr' | 'rtl';
  is_active: boolean;
}

export interface UpdateSpaceDto {
  name?: string;
  name_fa?: string;
  slug?: string;
  icon?: string;
  color?: string;
  order_index?: number;
  direction?: 'ltr' | 'rtl';
  is_active?: boolean;
}

export interface CreatePageDto {
  space_id: string;
  name: string;
  name_fa?: string;
  slug: string;
  icon: string;
  order_index: number;
  is_default: boolean;
  is_active: boolean;
}

export interface UpdatePageDto {
  space_id?: string;
  name?: string;
  name_fa?: string;
  slug?: string;
  icon?: string;
  order_index?: number;
  is_default?: boolean;
  is_active?: boolean;
}

export interface CreateSectionDto {
  page_id: string;
  name: string;
  name_fa?: string;
  order_index: number;
  is_active: boolean;
}

export interface UpdateSectionDto {
  page_id?: string;
  name?: string;
  name_fa?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface CreateTileDto {
  section_id: string;
  name: string;
  name_fa?: string;
  description?: string;
  icon: string;
  color: string;
  slug: string;
  type: 'form' | 'link' | 'kpi' | 'app';
  order_index: number;
  direction?: 'ltr' | 'rtl';
  config?: Record<string, any>;
  form_id?: string;
  is_active: boolean;
}

export interface UpdateTileDto {
  section_id?: string;
  name?: string;
  name_fa?: string;
  description?: string;
  icon?: string;
  color?: string;
  slug?: string;
  type?: 'form' | 'link' | 'kpi' | 'app';
  order_index?: number;
  direction?: 'ltr' | 'rtl';
  config?: Record<string, any>;
  form_id?: string;
  is_active?: boolean;
}

// ==================== SPACES ====================

export async function getAllSpaces(): Promise<Space[]> {
  const result = await query(`
    SELECT * FROM spaces ORDER BY order_index
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
    is_active: row.is_active
  }));
}

export async function getSpaceById(id: string): Promise<Space | null> {
  const result = await query('SELECT * FROM spaces WHERE id = $1', [id]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    name_fa: row.name_fa,
    slug: row.slug,
    icon: row.icon,
    color: row.color,
    order_index: row.order_index,
    direction: row.direction,
    is_active: row.is_active
  };
}

export async function createSpace(data: CreateSpaceDto): Promise<Space> {
  const result = await query(`
    INSERT INTO spaces (name, name_fa, slug, icon, color, order_index, direction, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    data.name,
    data.name_fa,
    data.slug,
    data.icon,
    data.color,
    data.order_index,
    data.direction,
    data.is_active
  ]);

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    name_fa: row.name_fa,
    slug: row.slug,
    icon: row.icon,
    color: row.color,
    order_index: row.order_index,
    direction: row.direction,
    is_active: row.is_active
  };
}

export async function updateSpace(id: string, data: UpdateSpaceDto): Promise<Space | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.name_fa !== undefined) {
    fields.push(`name_fa = $${paramIndex++}`);
    values.push(data.name_fa);
  }
  if (data.slug !== undefined) {
    fields.push(`slug = $${paramIndex++}`);
    values.push(data.slug);
  }
  if (data.icon !== undefined) {
    fields.push(`icon = $${paramIndex++}`);
    values.push(data.icon);
  }
  if (data.color !== undefined) {
    fields.push(`color = $${paramIndex++}`);
    values.push(data.color);
  }
  if (data.order_index !== undefined) {
    fields.push(`order_index = $${paramIndex++}`);
    values.push(data.order_index);
  }
  if (data.direction !== undefined) {
    fields.push(`direction = $${paramIndex++}`);
    values.push(data.direction);
  }
  if (data.is_active !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    values.push(data.is_active);
  }

  if (fields.length === 0) {
    return getSpaceById(id);
  }

  values.push(id);
  const result = await query(`
    UPDATE spaces SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `, values);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    name_fa: row.name_fa,
    slug: row.slug,
    icon: row.icon,
    color: row.color,
    order_index: row.order_index,
    direction: row.direction,
    is_active: row.is_active
  };
}

export async function deleteSpace(id: string): Promise<void> {
  await query('DELETE FROM spaces WHERE id = $1', [id]);
}

// ==================== PAGES ====================

export async function getAllPages(spaceId?: string): Promise<Page[]> {
  let sql = 'SELECT * FROM pages';
  const params: any[] = [];

  if (spaceId) {
    sql += ' WHERE space_id = $1';
    params.push(spaceId);
  }

  sql += ' ORDER BY order_index';

  const result = await query(sql, params);

  return result.rows.map((row: any) => ({
    id: row.id,
    space_id: row.space_id,
    name: row.name,
    name_fa: row.name_fa,
    slug: row.slug,
    icon: row.icon,
    order_index: row.order_index,
    is_default: row.is_default,
    is_active: row.is_active
  }));
}

export async function getPageById(id: string): Promise<Page | null> {
  const result = await query('SELECT * FROM pages WHERE id = $1', [id]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    space_id: row.space_id,
    name: row.name,
    name_fa: row.name_fa,
    slug: row.slug,
    icon: row.icon,
    order_index: row.order_index,
    is_default: row.is_default,
    is_active: row.is_active
  };
}

export async function createPage(data: CreatePageDto): Promise<Page> {
  const result = await query(`
    INSERT INTO pages (space_id, name, name_fa, slug, icon, order_index, is_default, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    data.space_id,
    data.name,
    data.name_fa,
    data.slug,
    data.icon,
    data.order_index,
    data.is_default,
    data.is_active
  ]);

  const row = result.rows[0];
  return {
    id: row.id,
    space_id: row.space_id,
    name: row.name,
    name_fa: row.name_fa,
    slug: row.slug,
    icon: row.icon,
    order_index: row.order_index,
    is_default: row.is_default,
    is_active: row.is_active
  };
}

export async function updatePage(id: string, data: UpdatePageDto): Promise<Page | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.space_id !== undefined) {
    fields.push(`space_id = $${paramIndex++}`);
    values.push(data.space_id);
  }
  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.name_fa !== undefined) {
    fields.push(`name_fa = $${paramIndex++}`);
    values.push(data.name_fa);
  }
  if (data.slug !== undefined) {
    fields.push(`slug = $${paramIndex++}`);
    values.push(data.slug);
  }
  if (data.icon !== undefined) {
    fields.push(`icon = $${paramIndex++}`);
    values.push(data.icon);
  }
  if (data.order_index !== undefined) {
    fields.push(`order_index = $${paramIndex++}`);
    values.push(data.order_index);
  }
  if (data.is_default !== undefined) {
    fields.push(`is_default = $${paramIndex++}`);
    values.push(data.is_default);
  }
  if (data.is_active !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    values.push(data.is_active);
  }

  if (fields.length === 0) {
    return getPageById(id);
  }

  values.push(id);
  const result = await query(`
    UPDATE pages SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `, values);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    space_id: row.space_id,
    name: row.name,
    name_fa: row.name_fa,
    slug: row.slug,
    icon: row.icon,
    order_index: row.order_index,
    is_default: row.is_default,
    is_active: row.is_active
  };
}

export async function deletePage(id: string): Promise<void> {
  await query('DELETE FROM pages WHERE id = $1', [id]);
}

// ==================== SECTIONS ====================

export async function getAllSections(pageId?: string): Promise<Section[]> {
  let sql = 'SELECT * FROM sections';
  const params: any[] = [];

  if (pageId) {
    sql += ' WHERE page_id = $1';
    params.push(pageId);
  }

  sql += ' ORDER BY order_index';

  const result = await query(sql, params);

  return result.rows.map((row: any) => ({
    id: row.id,
    page_id: row.page_id,
    name: row.name,
    name_fa: row.name_fa,
    order_index: row.order_index,
    is_active: row.is_active
  }));
}

export async function getSectionById(id: string): Promise<Section | null> {
  const result = await query('SELECT * FROM sections WHERE id = $1', [id]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    page_id: row.page_id,
    name: row.name,
    name_fa: row.name_fa,
    order_index: row.order_index,
    is_active: row.is_active
  };
}

export async function createSection(data: CreateSectionDto): Promise<Section> {
  const result = await query(`
    INSERT INTO sections (page_id, name, name_fa, order_index, is_active)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [
    data.page_id,
    data.name,
    data.name_fa,
    data.order_index,
    data.is_active
  ]);

  const row = result.rows[0];
  return {
    id: row.id,
    page_id: row.page_id,
    name: row.name,
    name_fa: row.name_fa,
    order_index: row.order_index,
    is_active: row.is_active
  };
}

export async function updateSection(id: string, data: UpdateSectionDto): Promise<Section | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.page_id !== undefined) {
    fields.push(`page_id = $${paramIndex++}`);
    values.push(data.page_id);
  }
  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.name_fa !== undefined) {
    fields.push(`name_fa = $${paramIndex++}`);
    values.push(data.name_fa);
  }
  if (data.order_index !== undefined) {
    fields.push(`order_index = $${paramIndex++}`);
    values.push(data.order_index);
  }
  if (data.is_active !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    values.push(data.is_active);
  }

  if (fields.length === 0) {
    return getSectionById(id);
  }

  values.push(id);
  const result = await query(`
    UPDATE sections SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `, values);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    page_id: row.page_id,
    name: row.name,
    name_fa: row.name_fa,
    order_index: row.order_index,
    is_active: row.is_active
  };
}

export async function deleteSection(id: string): Promise<void> {
  await query('DELETE FROM sections WHERE id = $1', [id]);
}

// ==================== TILES ====================

export async function getAllTiles(sectionId?: string): Promise<Tile[]> {
  let sql = `
    SELECT t.*, f.name as form_name, f.slug as form_slug
    FROM tiles t
    LEFT JOIN forms f ON t.form_id = f.id
  `;
  const params: any[] = [];

  if (sectionId) {
    sql += ' WHERE t.section_id = $1';
    params.push(sectionId);
  }

  sql += ' ORDER BY t.order_index';

  const result = await query(sql, params);

  return result.rows.map((row: any) => ({
    id: row.id,
    section_id: row.section_id,
    name: row.name,
    name_fa: row.name_fa,
    description: row.description,
    icon: row.icon,
    color: row.color,
    slug: row.slug,
    type: row.type,
    order_index: row.order_index,
    direction: row.direction,
    config: row.config,
    form_id: row.form_id,
    is_active: row.is_active,
    form_name: row.form_name,
    form_slug: row.form_slug
  }));
}

export async function getTileById(id: string): Promise<Tile | null> {
  const result = await query(`
    SELECT t.*, f.name as form_name, f.slug as form_slug
    FROM tiles t
    LEFT JOIN forms f ON t.form_id = f.id
    WHERE t.id = $1
  `, [id]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    section_id: row.section_id,
    name: row.name,
    name_fa: row.name_fa,
    description: row.description,
    icon: row.icon,
    color: row.color,
    slug: row.slug,
    type: row.type,
    order_index: row.order_index,
    direction: row.direction,
    config: row.config,
    form_id: row.form_id,
    is_active: row.is_active,
    form_name: row.form_name,
    form_slug: row.form_slug
  };
}

export async function createTile(data: CreateTileDto): Promise<Tile> {
  const result = await query(`
    INSERT INTO tiles (section_id, name, name_fa, description, icon, color, slug, type, order_index, direction, config, form_id, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `, [
    data.section_id,
    data.name,
    data.name_fa,
    data.description,
    data.icon,
    data.color,
    data.slug,
    data.type,
    data.order_index,
    data.direction,
    data.config ? JSON.stringify(data.config) : null,
    data.form_id || null,
    data.is_active
  ]);

  const row = result.rows[0];
  return {
    id: row.id,
    section_id: row.section_id,
    name: row.name,
    name_fa: row.name_fa,
    description: row.description,
    icon: row.icon,
    color: row.color,
    slug: row.slug,
    type: row.type,
    order_index: row.order_index,
    direction: row.direction,
    config: row.config,
    form_id: row.form_id,
    is_active: row.is_active
  };
}

export async function updateTile(id: string, data: UpdateTileDto): Promise<Tile | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.section_id !== undefined) {
    fields.push(`section_id = $${paramIndex++}`);
    values.push(data.section_id);
  }
  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.name_fa !== undefined) {
    fields.push(`name_fa = $${paramIndex++}`);
    values.push(data.name_fa);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.icon !== undefined) {
    fields.push(`icon = $${paramIndex++}`);
    values.push(data.icon);
  }
  if (data.color !== undefined) {
    fields.push(`color = $${paramIndex++}`);
    values.push(data.color);
  }
  if (data.slug !== undefined) {
    fields.push(`slug = $${paramIndex++}`);
    values.push(data.slug);
  }
  if (data.type !== undefined) {
    fields.push(`type = $${paramIndex++}`);
    values.push(data.type);
  }
  if (data.order_index !== undefined) {
    fields.push(`order_index = $${paramIndex++}`);
    values.push(data.order_index);
  }
  if (data.direction !== undefined) {
    fields.push(`direction = $${paramIndex++}`);
    values.push(data.direction);
  }
  if (data.config !== undefined) {
    fields.push(`config = $${paramIndex++}`);
    values.push(data.config ? JSON.stringify(data.config) : null);
  }
  if (data.form_id !== undefined) {
    fields.push(`form_id = $${paramIndex++}`);
    values.push(data.form_id);
  }
  if (data.is_active !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    values.push(data.is_active);
  }

  if (fields.length === 0) {
    return getTileById(id);
  }

  values.push(id);
  const result = await query(`
    UPDATE tiles SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `, values);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    section_id: row.section_id,
    name: row.name,
    name_fa: row.name_fa,
    description: row.description,
    icon: row.icon,
    color: row.color,
    slug: row.slug,
    type: row.type,
    order_index: row.order_index,
    direction: row.direction,
    config: row.config,
    form_id: row.form_id,
    is_active: row.is_active
  };
}

export async function deleteTile(id: string): Promise<void> {
  await query('DELETE FROM tiles WHERE id = $1', [id]);
}
