import { query } from '../config/database';
import { Form, CreateFormInput, fieldToFormioComponent, FormSchema } from '../models/form.model';
import { slugify } from '../utils/slugify';
import { v4 as uuidv4 } from 'uuid';

/**
 * Detect text direction based on Persian/Arabic characters
 * Returns 'rtl' if Persian/Arabic characters detected, otherwise 'ltr'
 */
function detectDirection(text: string): 'ltr' | 'rtl' {
  // Persian/Arabic Unicode ranges: \u0600-\u06FF (Arabic), \u0750-\u077F (Arabic Supplement), \uFB50-\uFDFF (Arabic Presentation Forms-A), \uFE70-\uFEFF (Arabic Presentation Forms-B)
  const persianArabicRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return persianArabicRegex.test(text) ? 'rtl' : 'ltr';
}

export async function createForm(input: CreateFormInput, createdBy?: string): Promise<Form> {
  const id = uuidv4();
  const slug = slugify(input.name);
  const schema: FormSchema = { components: input.fields.map(fieldToFormioComponent) };

  // Auto-detect direction from form name and field labels
  const textToAnalyze = [
    input.name,
    input.description || '',
    ...input.fields.map(f => f.label || '')
  ].join(' ');
  const direction = detectDirection(textToAnalyze);

  const result = await query(
    `INSERT INTO forms (id, slug, name, description, schema, direction, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [id, slug, input.name, input.description || null, JSON.stringify(schema), direction, createdBy]
  );
  return mapRowToForm(result.rows[0]);
}

export async function getFormBySlug(slug: string): Promise<Form | null> {
  const result = await query(
    `SELECT id, slug, name, name_fa, description, schema, status,
            section_id, icon, color, order_index, direction, navigation_type,
            workflow_enabled, workflow_process_id, created_by, created_at, updated_at
     FROM forms WHERE slug = $1 AND status = $2`,
    [slug, 'active']
  );
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
    name_fa: row.name_fa || '',
    description: row.description,
    schema: typeof row.schema === 'string' ? JSON.parse(row.schema) : row.schema,
    status: row.status,
    icon: row.icon,
    color: row.color,
    direction: row.direction || 'ltr',
    navigation_type: row.navigation_type || 'default',
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  };
}

/**
 * Update workflow settings for a form
 */
export async function updateFormWorkflow(
  formId: string,
  workflowEnabled: boolean,
  workflowProcessId: string | null
): Promise<void> {
  await query(
    `UPDATE forms
     SET workflow_enabled = $1, workflow_process_id = $2
     WHERE id = $3`,
    [workflowEnabled, workflowProcessId, formId]
  );
}

/**
 * Get all forms with workflow info (for admin)
 */
export async function getAllFormsWithWorkflow(): Promise<any[]> {
  const result = await query(
    `SELECT id, slug, name, name_fa, status,
            workflow_enabled, workflow_process_id
     FROM forms ORDER BY name`
  );
  return result.rows;
}

