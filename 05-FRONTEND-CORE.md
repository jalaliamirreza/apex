# APEX MVP — Part 5: Frontend Implementation

## frontend/Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

## frontend/package.json

```json
{
  "name": "apex-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@formio/react": "^5.3.0",
    "axios": "^1.6.2",
    "formiojs": "^4.17.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.10"
  }
}
```

## frontend/vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { port: 3000, host: true }
});
```

## frontend/tailwind.config.js

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: []
}
```

## frontend/postcss.config.js

```javascript
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} }
}
```

## frontend/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

## frontend/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>APEX</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

## frontend/src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## frontend/src/main.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </React.StrictMode>
);
```

## frontend/src/App.tsx

```typescript
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FormsListPage from './pages/FormsListPage';
import FormPage from './pages/FormPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/forms" element={<FormsListPage />} />
          <Route path="/forms/:slug" element={<FormPage />} />
          <Route path="/forms/:slug/submissions" element={<SubmissionsPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;
```

## frontend/src/types/index.ts

```typescript
export interface Form {
  id: string;
  slug: string;
  name: string;
  description?: string;
  schema: { components: any[] };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedBy?: string;
  submittedAt: string;
}

export interface SearchResult {
  submissionId: string;
  formSlug: string;
  formName: string;
  data: Record<string, any>;
  submittedAt: string;
  highlights: string[];
  score: number;
}
```

## frontend/src/services/api.ts

```typescript
import axios from 'axios';
import { Form, Submission, SearchResult } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'
});

export async function getForms(): Promise<Form[]> {
  const { data } = await api.get('/forms');
  return data.forms;
}

export async function getForm(slug: string): Promise<Form> {
  const { data } = await api.get(`/forms/${slug}`);
  return data;
}

export async function submitForm(slug: string, formData: Record<string, any>): Promise<Submission> {
  const { data } = await api.post(`/forms/${slug}/submissions`, { data: formData });
  return data;
}

export async function getSubmissions(slug: string): Promise<{ submissions: Submission[]; total: number }> {
  const { data } = await api.get(`/forms/${slug}/submissions`);
  return data;
}

export async function search(query: string): Promise<{ results: SearchResult[]; total: number }> {
  const { data } = await api.get('/search', { params: { q: query } });
  return data;
}

export default api;
```

## frontend/src/components/Navbar.tsx

```typescript
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">APEX</Link>
            <div className="ml-10 flex space-x-4">
              <Link to="/forms" className="text-gray-700 hover:text-blue-600 px-3 py-2">Forms</Link>
              <Link to="/search" className="text-gray-700 hover:text-blue-600 px-3 py-2">Search</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

## frontend/src/components/FormRenderer.tsx

```typescript
import { Form } from '@formio/react';

interface FormRendererProps {
  schema: { components: any[] };
  onSubmit: (submission: { data: Record<string, any> }) => void;
}

export default function FormRenderer({ schema, onSubmit }: FormRendererProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Form form={schema} onSubmit={onSubmit} />
    </div>
  );
}
```

## frontend/src/components/FormList.tsx

```typescript
import { Link } from 'react-router-dom';
import { Form } from '../types';

export default function FormList({ forms }: { forms: Form[] }) {
  if (forms.length === 0) return <div className="text-center py-8 text-gray-500">No forms available.</div>;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <div key={form.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
          {form.description && <p className="mt-2 text-gray-600 text-sm">{form.description}</p>}
          <div className="mt-4 flex space-x-2">
            <Link to={`/forms/${form.slug}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Fill Form →</Link>
            <Link to={`/forms/${form.slug}/submissions`} className="text-gray-600 hover:text-gray-800 text-sm font-medium">Submissions</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## frontend/src/components/SubmissionList.tsx

```typescript
import { Submission } from '../types';

export default function SubmissionList({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) return <div className="text-center py-8 text-gray-500">No submissions yet.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {submissions.map((s) => (
            <tr key={s.id}>
              <td className="px-6 py-4 text-sm text-gray-500">{s.id.substring(0, 8)}...</td>
              <td className="px-6 py-4 text-sm"><pre className="text-xs">{JSON.stringify(s.data, null, 2)}</pre></td>
              <td className="px-6 py-4 text-sm text-gray-500">{new Date(s.submittedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## frontend/src/components/SearchBar.tsx

```typescript
import { useState } from 'react';

export default function SearchBar({ onSearch, isLoading }: { onSearch: (q: string) => void; isLoading?: boolean }) {
  const [query, setQuery] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (query.trim()) onSearch(query.trim()); };
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search submissions..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
      <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
```
