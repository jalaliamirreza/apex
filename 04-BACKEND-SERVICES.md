# APEX MVP — Part 4: Backend Services & Routes

## backend/src/services/form.service.ts

```typescript
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
```

## backend/src/services/submission.service.ts

```typescript
import { query } from '../config/database';
import { Submission, CreateSubmissionInput } from '../models/submission.model';
import { getOpenSearchClient, SUBMISSIONS_INDEX } from '../config/opensearch';
import { getFormById } from './form.service';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export async function createSubmission(formId: string, input: CreateSubmissionInput, submittedBy?: string): Promise<Submission> {
  const id = uuidv4();
  const result = await query(
    `INSERT INTO submissions (id, form_id, data, files, submitted_by) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, formId, JSON.stringify(input.data), JSON.stringify(input.files || []), submittedBy]
  );
  const submission = mapRowToSubmission(result.rows[0]);
  await indexSubmission(submission, formId);
  return submission;
}

export async function getSubmissionsByFormId(formId: string, limit = 50, offset = 0): Promise<{ submissions: Submission[]; total: number }> {
  const countResult = await query('SELECT COUNT(*) FROM submissions WHERE form_id = $1', [formId]);
  const total = parseInt(countResult.rows[0].count);
  const result = await query(
    `SELECT * FROM submissions WHERE form_id = $1 ORDER BY submitted_at DESC LIMIT $2 OFFSET $3`,
    [formId, limit, offset]
  );
  return { submissions: result.rows.map(mapRowToSubmission), total };
}

async function indexSubmission(submission: Submission, formId: string): Promise<void> {
  try {
    const form = await getFormById(formId);
    if (!form) return;
    const client = getOpenSearchClient();
    const dataText = Object.values(submission.data).filter(v => typeof v === 'string' || typeof v === 'number').join(' ');
    await client.index({
      index: SUBMISSIONS_INDEX,
      id: submission.id,
      body: { formId: form.id, formSlug: form.slug, formName: form.name, data: submission.data, dataText, submittedBy: submission.submittedBy, submittedAt: submission.submittedAt.toISOString() },
      refresh: true
    });
  } catch (error) {
    logger.error('Failed to index submission:', error);
  }
}

function mapRowToSubmission(row: any): Submission {
  return {
    id: row.id,
    formId: row.form_id,
    data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
    files: typeof row.files === 'string' ? JSON.parse(row.files) : row.files,
    submittedBy: row.submitted_by,
    submittedAt: new Date(row.submitted_at)
  };
}
```

## backend/src/services/search.service.ts

```typescript
import { getOpenSearchClient, SUBMISSIONS_INDEX } from '../config/opensearch';
import { logger } from '../utils/logger';

export interface SearchResult {
  submissionId: string;
  formSlug: string;
  formName: string;
  data: Record<string, any>;
  submittedAt: string;
  highlights: string[];
  score: number;
}

export interface SearchOptions {
  query: string;
  formSlug?: string;
  limit?: number;
  offset?: number;
}

export async function searchSubmissions(options: SearchOptions): Promise<{ results: SearchResult[]; total: number }> {
  const client = getOpenSearchClient();
  const must: any[] = [{ multi_match: { query: options.query, fields: ['dataText^2', 'formName', 'data.*'], fuzziness: 'AUTO' } }];
  if (options.formSlug) must.push({ term: { formSlug: options.formSlug } });

  try {
    const response = await client.search({
      index: SUBMISSIONS_INDEX,
      body: {
        query: { bool: { must } },
        highlight: { fields: { dataText: {}, 'data.*': {} } },
        from: options.offset || 0,
        size: options.limit || 20,
        sort: [{ _score: 'desc' }, { submittedAt: 'desc' }]
      }
    });

    const hits = response.body.hits.hits;
    const total = response.body.hits.total.value;
    const results: SearchResult[] = hits.map((hit: any) => ({
      submissionId: hit._id,
      formSlug: hit._source.formSlug,
      formName: hit._source.formName,
      data: hit._source.data,
      submittedAt: hit._source.submittedAt,
      highlights: hit.highlight ? Object.values(hit.highlight).flat() : [],
      score: hit._score
    }));
    return { results, total };
  } catch (error) {
    logger.error('Search error:', error);
    return { results: [], total: 0 };
  }
}
```

## backend/src/routes/index.ts

```typescript
import { Router } from 'express';
import formRoutes from './form.routes';
import submissionRoutes from './submission.routes';
import searchRoutes from './search.routes';

const router = Router();
router.use('/forms', formRoutes);
router.use('/forms', submissionRoutes);
router.use('/search', searchRoutes);
export default router;
```

## backend/src/routes/form.routes.ts

```typescript
import { Router, Response } from 'express';
import { AuthRequest, internalAuthMiddleware } from '../middleware/auth.middleware';
import * as formService from '../services/form.service';
import { logger } from '../utils/logger';

const router = Router();

router.post('/', internalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, fields } = req.body;
    if (!name || !fields || !Array.isArray(fields)) {
      res.status(400).json({ error: 'Name and fields are required' });
      return;
    }
    const form = await formService.createForm({ name, description, fields }, req.user?.preferred_username);
    res.status(201).json({ ...form, url: `/forms/${form.slug}` });
  } catch (error: any) {
    logger.error('Create form error:', error);
    if (error.code === '23505') { res.status(409).json({ error: 'Form already exists' }); return; }
    res.status(500).json({ error: 'Failed to create form' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const forms = await formService.listForms();
    res.json({ forms });
  } catch (error) {
    logger.error('List forms error:', error);
    res.status(500).json({ error: 'Failed to list forms' });
  }
});

router.get('/:slug', async (req: AuthRequest, res: Response) => {
  try {
    const form = await formService.getFormBySlug(req.params.slug);
    if (!form) { res.status(404).json({ error: 'Form not found' }); return; }
    res.json(form);
  } catch (error) {
    logger.error('Get form error:', error);
    res.status(500).json({ error: 'Failed to get form' });
  }
});

router.delete('/:slug', internalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const success = await formService.archiveForm(req.params.slug);
    if (!success) { res.status(404).json({ error: 'Form not found' }); return; }
    res.json({ message: 'Form archived' });
  } catch (error) {
    logger.error('Archive form error:', error);
    res.status(500).json({ error: 'Failed to archive form' });
  }
});

export default router;
```

## backend/src/routes/submission.routes.ts

```typescript
import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as formService from '../services/form.service';
import * as submissionService from '../services/submission.service';
import { logger } from '../utils/logger';

const router = Router();

router.post('/:slug/submissions', async (req: AuthRequest, res: Response) => {
  try {
    const form = await formService.getFormBySlug(req.params.slug);
    if (!form) { res.status(404).json({ error: 'Form not found' }); return; }
    const { data, files } = req.body;
    if (!data || typeof data !== 'object') { res.status(400).json({ error: 'Data is required' }); return; }
    const submission = await submissionService.createSubmission(form.id, { data, files }, req.user?.preferred_username);
    res.status(201).json(submission);
  } catch (error) {
    logger.error('Create submission error:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

router.get('/:slug/submissions', async (req: AuthRequest, res: Response) => {
  try {
    const form = await formService.getFormBySlug(req.params.slug);
    if (!form) { res.status(404).json({ error: 'Form not found' }); return; }
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await submissionService.getSubmissionsByFormId(form.id, limit, offset);
    res.json(result);
  } catch (error) {
    logger.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

export default router;
```

## backend/src/routes/search.routes.ts

```typescript
import { Router, Response } from 'express';
import { AuthRequest, internalAuthMiddleware } from '../middleware/auth.middleware';
import * as searchService from '../services/search.service';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', internalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) { res.status(400).json({ error: 'Query parameter q is required' }); return; }
    const results = await searchService.searchSubmissions({
      query,
      limit: parseInt(req.query.limit as string) || 20,
      offset: parseInt(req.query.offset as string) || 0
    });
    res.json(results);
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.post('/', internalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { query, formSlug, limit, offset } = req.body;
    if (!query) { res.status(400).json({ error: 'Query is required' }); return; }
    const results = await searchService.searchSubmissions({ query, formSlug, limit: limit || 20, offset: offset || 0 });
    res.json(results);
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
```
