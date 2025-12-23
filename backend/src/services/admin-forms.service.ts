import { query } from '../config/database';

export interface FormListItem {
  id: string;
  name: string;
  name_fa: string;
  slug: string;
  description: string | null;
  status: string;
  icon: string;
  color: string;
  direction: string;
  navigation_type: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFormDto {
  name: string;
  name_fa?: string;
  slug: string;
  description?: string;
  schema: object;
  status: string;
  icon?: string;
  color?: string;
}

export interface UpdateFormDto {
  name?: string;
  name_fa?: string;
  slug?: string;
  description?: string;
  schema?: object;
  status?: string;
  icon?: string;
  color?: string;
  direction?: string;
  navigation_type?: string;
}

// Get all forms (for listing and for tile form selector)
export async function getAllForms(): Promise<FormListItem[]> {
  const result = await query(`
    SELECT id, name, name_fa, slug, description, status, icon, color, direction, navigation_type, created_at, updated_at
    FROM forms
    ORDER BY name
  `);
  return result.rows;
}

// Get form by ID
export async function getFormById(id: string) {
  const result = await query('SELECT * FROM forms WHERE id = $1', [id]);
  return result.rows[0] || null;
}

// Create form
export async function createForm(data: CreateFormDto) {
  const result = await query(`
    INSERT INTO forms (name, name_fa, slug, description, schema, status, icon, color)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    data.name,
    data.name_fa,
    data.slug,
    data.description,
    JSON.stringify(data.schema),
    data.status,
    data.icon || 'document',
    data.color || '#0a6ed1'
  ]);
  return result.rows[0];
}

// Update form
export async function updateForm(id: string, data: UpdateFormDto) {
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
  if (data.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.schema !== undefined) {
    fields.push(`schema = $${paramIndex++}`);
    values.push(JSON.stringify(data.schema));
  }
  if (data.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }
  if (data.icon !== undefined) {
    fields.push(`icon = $${paramIndex++}`);
    values.push(data.icon);
  }
  if (data.color !== undefined) {
    fields.push(`color = $${paramIndex++}`);
    values.push(data.color);
  }
  if (data.direction !== undefined) {
    fields.push(`direction = $${paramIndex++}`);
    values.push(data.direction);
  }
  if (data.navigation_type !== undefined) {
    fields.push(`navigation_type = $${paramIndex++}`);
    values.push(data.navigation_type);
  }

  if (fields.length === 0) {
    return getFormById(id);
  }

  values.push(id);
  const result = await query(`
    UPDATE forms SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `, values);

  return result.rows[0] || null;
}

// Delete form
export async function deleteForm(id: string): Promise<void> {
  // First unlink from tiles
  await query('UPDATE tiles SET form_id = NULL WHERE form_id = $1', [id]);
  // Then delete form
  await query('DELETE FROM forms WHERE id = $1', [id]);
}
