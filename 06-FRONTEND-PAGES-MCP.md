# APEX MVP — Part 6: Frontend Pages & MCP Server

## frontend/src/pages/HomePage.tsx

```typescript
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to APEX</h1>
      <p className="text-xl text-gray-600 mb-8">AI-Powered Process Execution Platform</p>
      <p className="text-gray-500 mb-8">Describe your forms in natural language. Claude will create them.</p>
      <div className="flex justify-center gap-4">
        <Link to="/forms" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View Forms</Link>
        <Link to="/search" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Search</Link>
      </div>
    </div>
  );
}
```

## frontend/src/pages/FormsListPage.tsx

```typescript
import { useState, useEffect } from 'react';
import FormList from '../components/FormList';
import { getForms } from '../services/api';
import { Form } from '../types';

export default function FormsListPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getForms().then(setForms).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Loading forms...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Available Forms</h1>
      <FormList forms={forms} />
    </div>
  );
}
```

## frontend/src/pages/FormPage.tsx

```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormRenderer from '../components/FormRenderer';
import { getForm, submitForm } from '../services/api';
import { Form } from '../types';

export default function FormPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (slug) getForm(slug).then(setForm).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (submission: { data: Record<string, any> }) => {
    if (!slug) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitForm(slug, submission.data);
      setSuccess(true);
      setTimeout(() => navigate(`/forms/${slug}/submissions`), 2000);
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="text-center py-8">Loading form...</div>;
  if (error && !form) return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  if (!form) return <div className="text-center py-8">Form not found</div>;
  if (success) return (
    <div className="text-center py-8">
      <div className="text-green-600 text-xl mb-4">✓ Form submitted!</div>
      <p className="text-gray-500">Redirecting...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.name}</h1>
      {form.description && <p className="text-gray-600 mb-6">{form.description}</p>}
      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      <FormRenderer schema={form.schema} onSubmit={handleSubmit} />
      {submitting && <div className="mt-4 text-center text-gray-500">Submitting...</div>}
    </div>
  );
}
```

## frontend/src/pages/SubmissionsPage.tsx

```typescript
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SubmissionList from '../components/SubmissionList';
import { getForm, getSubmissions } from '../services/api';
import { Form, Submission } from '../types';

export default function SubmissionsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      Promise.all([getForm(slug), getSubmissions(slug)])
        .then(([f, s]) => { setForm(f); setSubmissions(s.submissions); })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{form?.name} - Submissions</h1>
          <p className="text-gray-500">{submissions.length} submission(s)</p>
        </div>
        <Link to={`/forms/${slug}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">New Submission</Link>
      </div>
      <SubmissionList submissions={submissions} />
    </div>
  );
}
```

## frontend/src/pages/SearchPage.tsx

```typescript
import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import { search } from '../services/api';
import { SearchResult } from '../types';
import { Link } from 'react-router-dom';

export default function SearchPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const data = await search(query);
      setResults(data.results);
      setTotal(data.total);
      setSearched(true);
    } catch (err) { console.error('Search error:', err); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Submissions</h1>
      <SearchBar onSearch={handleSearch} isLoading={loading} />
      {searched && (
        <div className="mt-8">
          <p className="text-gray-500 mb-4">Found {total} result(s)</p>
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No results found</div>
          ) : (
            <div className="space-y-4">
              {results.map((r) => (
                <div key={r.submissionId} className="bg-white p-6 rounded-lg shadow">
                  <Link to={`/forms/${r.formSlug}/submissions`} className="text-lg font-semibold text-blue-600 hover:text-blue-800">{r.formName}</Link>
                  <p className="text-sm text-gray-500 mt-1">{new Date(r.submittedAt).toLocaleString()}</p>
                  <pre className="mt-4 text-sm bg-gray-50 p-3 rounded overflow-x-auto">{JSON.stringify(r.data, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

# MCP Server Implementation

## mcp-server/Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

## mcp-server/package.json

```json
{
  "name": "apex-mcp-server",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn src/index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "axios": "^1.6.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3"
  }
}
```

## mcp-server/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## mcp-server/src/utils/apiClient.ts

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.APEX_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.APEX_API_KEY || 'apex-internal-key'
  }
});

export default apiClient;
```

## mcp-server/src/tools/createForm.ts

```typescript
import apiClient from '../utils/apiClient';

interface CreateFormArgs {
  name: string;
  description?: string;
  fields: Array<{ name: string; type: string; label: string; required?: boolean; options?: string[]; placeholder?: string }>;
}

export async function createForm(args: CreateFormArgs) {
  const { data } = await apiClient.post('/forms', args);
  return {
    content: [{
      type: 'text',
      text: `✓ Form "${data.name}" created!\n\n- ID: ${data.id}\n- Slug: ${data.slug}\n- URL: http://localhost:3000/forms/${data.slug}\n- Fields: ${data.schema.components.length}\n\nForm is live and ready.`
    }]
  };
}
```

## mcp-server/src/tools/listForms.ts

```typescript
import apiClient from '../utils/apiClient';

export async function listForms() {
  const { data } = await apiClient.get('/forms');
  if (data.forms.length === 0) return { content: [{ type: 'text', text: 'No forms yet. Use create_form to create one.' }] };
  const list = data.forms.map((f: any) => `- ${f.name} (/${f.slug}) - ${f.status}`).join('\n');
  return { content: [{ type: 'text', text: `Found ${data.forms.length} form(s):\n\n${list}` }] };
}
```

## mcp-server/src/tools/getForm.ts

```typescript
import apiClient from '../utils/apiClient';

export async function getForm(args: { slug: string }) {
  const { data } = await apiClient.get(`/forms/${args.slug}`);
  const fields = data.schema.components.map((c: any) => `- ${c.label} (${c.key}): ${c.type}${c.validate?.required ? ' [required]' : ''}`).join('\n');
  return { content: [{ type: 'text', text: `Form: ${data.name}\nDescription: ${data.description || 'None'}\nStatus: ${data.status}\n\nFields:\n${fields}` }] };
}
```

## mcp-server/src/tools/getSubmissions.ts

```typescript
import apiClient from '../utils/apiClient';

export async function getSubmissions(args: { formSlug: string; limit?: number; offset?: number }) {
  const { data } = await apiClient.get(`/forms/${args.formSlug}/submissions`, { params: { limit: args.limit || 50, offset: args.offset || 0 } });
  if (data.submissions.length === 0) return { content: [{ type: 'text', text: `No submissions for "${args.formSlug}".` }] };
  const list = data.submissions.map((s: any) => `ID: ${s.id.substring(0, 8)}...\nSubmitted: ${new Date(s.submittedAt).toLocaleString()}\nData:\n${JSON.stringify(s.data, null, 2)}`).join('\n\n---\n\n');
  return { content: [{ type: 'text', text: `Found ${data.total} submission(s):\n\n${list}` }] };
}
```

## mcp-server/src/tools/searchSubmissions.ts

```typescript
import apiClient from '../utils/apiClient';

export async function searchSubmissions(args: { query: string; formSlug?: string; limit?: number }) {
  const { data } = await apiClient.post('/search', { query: args.query, formSlug: args.formSlug, limit: args.limit || 20 });
  if (data.results.length === 0) return { content: [{ type: 'text', text: `No results for "${args.query}".` }] };
  const list = data.results.map((r: any) => `Form: ${r.formName}\nSubmitted: ${new Date(r.submittedAt).toLocaleString()}\nData:\n${JSON.stringify(r.data, null, 2)}`).join('\n\n---\n\n');
  return { content: [{ type: 'text', text: `Found ${data.total} result(s):\n\n${list}` }] };
}
```

## mcp-server/src/index.ts

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createForm } from './tools/createForm';
import { listForms } from './tools/listForms';
import { getForm } from './tools/getForm';
import { getSubmissions } from './tools/getSubmissions';
import { searchSubmissions } from './tools/searchSubmissions';

const server = new Server({ name: 'apex-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'create_form', description: 'Create a new form', inputSchema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, fields: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, type: { type: 'string', enum: ['text', 'textarea', 'number', 'email', 'date', 'select', 'checkbox', 'file', 'signature'] }, label: { type: 'string' }, required: { type: 'boolean' }, options: { type: 'array', items: { type: 'string' } } }, required: ['name', 'type', 'label'] } } }, required: ['name', 'fields'] } },
    { name: 'list_forms', description: 'List all forms', inputSchema: { type: 'object', properties: {} } },
    { name: 'get_form', description: 'Get form details', inputSchema: { type: 'object', properties: { slug: { type: 'string' } }, required: ['slug'] } },
    { name: 'get_submissions', description: 'Get form submissions', inputSchema: { type: 'object', properties: { formSlug: { type: 'string' }, limit: { type: 'number' }, offset: { type: 'number' } }, required: ['formSlug'] } },
    { name: 'search_submissions', description: 'Search submissions', inputSchema: { type: 'object', properties: { query: { type: 'string' }, formSlug: { type: 'string' }, limit: { type: 'number' } }, required: ['query'] } }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    switch (name) {
      case 'create_form': return await createForm(args as any);
      case 'list_forms': return await listForms();
      case 'get_form': return await getForm(args as any);
      case 'get_submissions': return await getSubmissions(args as any);
      case 'search_submissions': return await searchSubmissions(args as any);
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) { return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }; }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('APEX MCP Server running');
}
main().catch(console.error);
```
