import { query } from '../config/database';
import { Form, CreateFormInput, fieldToFormioComponent, FormSchema } from '../models/form.model';
import { slugify } from '../utils/slugify';
import { v4 as uuidv4 } from 'uuid';

export async function createForm(input: CreateFormInput, createdBy?: string): Promise<Form> {
  const id = uuidv4();
  const slug = slugify(input.name);
  const schema: FormSchema = { components: input.fields.map(fieldToFormioComponent) };

  const result = await query(
    `INSERT INTO forms (id, slug, name, description, schema, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, slug, input.name, input.description || null, JSON.stringify(schema), createdBy]
  );
  return mapRowToForm(result.rows[0]);
}

export async function getFormBySlug(slug: string): Promise<Form | null> {
  const result = await query('SELECT * FROM forms WHERE slug = $1 AND status = $2', [slug, 'active']);
  return result.rows.length ? mapRowToForm(result.rows[0]) : null;
}

export async function getFormById(id: string): Promise<Form | null> {
  const result = await query('SELECT * FROM forms WHERE id = $1', [id]);
  return result.rows.length ? mapRowToForm(result.rows[0]) : null;
}

export async function listForms(): Promise<Form[]> {
  const result = await query('SELECT * FROM forms WHERE status = $1 ORDER BY created_at DESC', ['active']);
  return result.rows.map(mapRowToForm);
}

export async function archiveForm(slug: string): Promise<boolean> {
  const result = await query(`UPDATE forms SET status = 'archived' WHERE slug = $1`, [slug]);
  return (result.rowCount ?? 0) > 0;
}

function mapRowToForm(row: any): Form {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    schema: typeof row.schema === 'string' ? JSON.parse(row.schema) : row.schema,
    status: row.status,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}
