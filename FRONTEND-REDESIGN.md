# APEX Frontend Redesign - SAP Fiori Style

## Project Location
D:\Worklab\SAP\AI\apex\frontend

## Objective
Redesign APEX frontend using SAP Fiori design system with @ui5/webcomponents-react

## Current Stack
- React 18
- Vite
- Tailwind CSS
- Formio.js (keep for form rendering)

## New Dependencies to Add
- @ui5/webcomponents
- @ui5/webcomponents-react
- @ui5/webcomponents-icons
- @ui5/webcomponents-fiori

---

## Implementation Steps

### Step 1: Update package.json
Add these to dependencies:
```json
"@ui5/webcomponents": "^2.0.0",
"@ui5/webcomponents-react": "^2.0.0",
"@ui5/webcomponents-icons": "^2.0.0",
"@ui5/webcomponents-fiori": "^2.0.0"
```

### Step 2: Update src/main.tsx
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-react/dist/Assets.js';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
```

### Step 3: Update src/App.tsx
```tsx
import { Routes, Route } from 'react-router-dom';
import { ShellBar, Avatar } from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/home.js";
import "@ui5/webcomponents-icons/dist/list.js";
import "@ui5/webcomponents-icons/dist/search.js";
import HomePage from './pages/HomePage';
import FormsListPage from './pages/FormsListPage';
import FormPage from './pages/FormPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ShellBar
        primaryTitle="APEX"
        secondaryTitle="Form Management"
        showSearchField
        profile={<Avatar initials="U" />}
        onLogoClick={() => window.location.href = '/'}
      />
      <main style={{ flex: 1, padding: '1rem', backgroundColor: '#f7f7f7', overflow: 'auto' }}>
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

### Step 4: Update src/pages/HomePage.tsx
```tsx
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  FlexBox, 
  Title, 
  Text,
  Icon,
  Button
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/add.js";
import "@ui5/webcomponents-icons/dist/list.js";
import "@ui5/webcomponents-icons/dist/search.js";

function HomePage() {
  const navigate = useNavigate();

  const tiles = [
    { title: 'View Forms', subtitle: 'Browse all available forms', icon: 'list', path: '/forms' },
    { title: 'Search', subtitle: 'Search submissions', icon: 'search', path: '/search' },
  ];

  return (
    <FlexBox direction="Column" style={{ gap: '2rem', padding: '1rem' }}>
      <FlexBox direction="Column" style={{ gap: '0.5rem' }}>
        <Title level="H1">Welcome to APEX</Title>
        <Text>AI-Native Business Process Platform</Text>
      </FlexBox>

      <FlexBox wrap="Wrap" style={{ gap: '1rem' }}>
        {tiles.map((tile) => (
          <Card
            key={tile.path}
            style={{ width: '300px', cursor: 'pointer' }}
            onClick={() => navigate(tile.path)}
          >
            <CardHeader
              titleText={tile.title}
              subtitleText={tile.subtitle}
              avatar={<Icon name={tile.icon} />}
            />
          </Card>
        ))}
      </FlexBox>
    </FlexBox>
  );
}

export default HomePage;
```

### Step 5: Update src/pages/FormsListPage.tsx
```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  FlexBox,
  Title,
  Badge,
  Button,
  Icon,
  BusyIndicator
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/document.js";
import "@ui5/webcomponents-icons/dist/arrow-right.js";
import { formsApi } from '../services/api';
import { Form } from '../types';

function FormsListPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const data = await formsApi.list();
      setForms(data.forms || []);
    } catch (error) {
      console.error('Failed to load forms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ height: '200px' }}>
        <BusyIndicator active size="Large" />
      </FlexBox>
    );
  }

  return (
    <FlexBox direction="Column" style={{ gap: '1.5rem', padding: '1rem' }}>
      <FlexBox justifyContent="SpaceBetween" alignItems="Center">
        <Title level="H2">Forms</Title>
        <Badge colorScheme="8">{forms.length} forms</Badge>
      </FlexBox>

      <FlexBox wrap="Wrap" style={{ gap: '1rem' }}>
        {forms.length === 0 ? (
          <Card style={{ width: '100%', padding: '2rem', textAlign: 'center' }}>
            <Text>No forms yet. Ask Claude to create one!</Text>
          </Card>
        ) : (
          forms.map((form) => (
            <Card
              key={form.id}
              style={{ width: '350px', cursor: 'pointer' }}
              onClick={() => navigate(`/forms/${form.slug}`)}
            >
              <CardHeader
                titleText={form.name}
                subtitleText={form.description || 'No description'}
                avatar={<Icon name="document" />}
                action={
                  <Button
                    icon="arrow-right"
                    design="Transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/forms/${form.slug}`);
                    }}
                  />
                }
              />
            </Card>
          ))
        )}
      </FlexBox>
    </FlexBox>
  );
}

export default FormsListPage;
```

### Step 6: Update src/pages/FormPage.tsx
```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ObjectPage,
  ObjectPageSection,
  DynamicPageTitle,
  DynamicPageHeader,
  FlexBox,
  Title,
  Text,
  Badge,
  Button,
  BusyIndicator,
  MessageStrip
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/response.js";
import { Form as FormioForm } from '@formio/react';
import { formsApi } from '../services/api';
import { Form } from '../types';

function FormPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) loadForm();
  }, [slug]);

  const loadForm = async () => {
    try {
      const data = await formsApi.get(slug!);
      setForm(data);
    } catch (err) {
      setError('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (submission: any) => {
    try {
      await formsApi.submit(slug!, submission.data);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit form');
    }
  };

  if (loading) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ height: '300px' }}>
        <BusyIndicator active size="Large" />
      </FlexBox>
    );
  }

  if (error || !form) {
    return (
      <MessageStrip design="Negative" style={{ margin: '1rem' }}>
        {error || 'Form not found'}
      </MessageStrip>
    );
  }

  if (submitted) {
    return (
      <FlexBox 
        direction="Column" 
        alignItems="Center" 
        justifyContent="Center" 
        style={{ height: '300px', gap: '1rem' }}
      >
        <MessageStrip design="Positive">Form submitted successfully!</MessageStrip>
        <Button onClick={() => navigate('/forms')}>Back to Forms</Button>
      </FlexBox>
    );
  }

  return (
    <ObjectPage
      headerTitle={
        <DynamicPageTitle
          header={<Title>{form.name}</Title>}
          actions={
            <Button 
              icon="response" 
              onClick={() => navigate(`/forms/${slug}/submissions`)}
            >
              View Submissions
            </Button>
          }
        />
      }
      headerContent={
        <DynamicPageHeader>
          <FlexBox direction="Column" style={{ gap: '0.5rem' }}>
            <Text>{form.description || 'No description'}</Text>
            <Badge colorScheme="8">{form.status}</Badge>
          </FlexBox>
        </DynamicPageHeader>
      }
      style={{ height: 'calc(100vh - 100px)' }}
    >
      <ObjectPageSection id="form-section" titleText="Form">
        <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
          <FormioForm form={form.schema} onSubmit={handleSubmit} />
        </div>
      </ObjectPageSection>
    </ObjectPage>
  );
}

export default FormPage;
```

### Step 7: Update src/pages/SubmissionsPage.tsx
```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FlexBox,
  Title,
  Button,
  BusyIndicator,
  MessageStrip,
  Table,
  TableColumn,
  TableRow,
  TableCell,
  Label
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/nav-back.js";
import { formsApi } from '../services/api';

function SubmissionsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) loadSubmissions();
  }, [slug]);

  const loadSubmissions = async () => {
    try {
      const data = await formsApi.getSubmissions(slug!);
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ height: '200px' }}>
        <BusyIndicator active size="Large" />
      </FlexBox>
    );
  }

  if (error) {
    return <MessageStrip design="Negative">{error}</MessageStrip>;
  }

  const columns = submissions.length > 0 
    ? Object.keys(submissions[0].data || {}) 
    : [];

  return (
    <FlexBox direction="Column" style={{ gap: '1rem', padding: '1rem' }}>
      <FlexBox justifyContent="SpaceBetween" alignItems="Center">
        <FlexBox alignItems="Center" style={{ gap: '1rem' }}>
          <Button icon="nav-back" design="Transparent" onClick={() => navigate(`/forms/${slug}`)} />
          <Title level="H2">Submissions</Title>
        </FlexBox>
        <Label>{submissions.length} submissions</Label>
      </FlexBox>

      {submissions.length === 0 ? (
        <MessageStrip design="Information">No submissions yet</MessageStrip>
      ) : (
        <Table>
          <TableColumn slot="columns"><Label>ID</Label></TableColumn>
          {columns.map((col) => (
            <TableColumn key={col} slot="columns"><Label>{col}</Label></TableColumn>
          ))}
          <TableColumn slot="columns"><Label>Submitted</Label></TableColumn>

          {submissions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell><Label>{sub.id.slice(0, 8)}...</Label></TableCell>
              {columns.map((col) => (
                <TableCell key={col}>
                  <Label>{String(sub.data[col] || '-')}</Label>
                </TableCell>
              ))}
              <TableCell>
                <Label>{new Date(sub.createdAt).toLocaleString()}</Label>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </FlexBox>
  );
}

export default SubmissionsPage;
```

### Step 8: Update src/pages/SearchPage.tsx
```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlexBox,
  Title,
  Input,
  Button,
  Card,
  CardHeader,
  Text,
  BusyIndicator,
  MessageStrip,
  Icon
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/search.js";
import "@ui5/webcomponents-icons/dist/document.js";
import { searchApi } from '../services/api';

function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchApi.search(query);
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FlexBox direction="Column" style={{ gap: '1.5rem', padding: '1rem' }}>
      <Title level="H2">Search Submissions</Title>

      <FlexBox style={{ gap: '0.5rem' }}>
        <Input
          placeholder="Search..."
          value={query}
          onInput={(e: any) => setQuery(e.target.value)}
          onKeyPress={(e: any) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1 }}
        />
        <Button icon="search" design="Emphasized" onClick={handleSearch}>
          Search
        </Button>
      </FlexBox>

      {loading && (
        <FlexBox justifyContent="Center">
          <BusyIndicator active size="Medium" />
        </FlexBox>
      )}

      {!loading && searched && results.length === 0 && (
        <MessageStrip design="Information">No results found</MessageStrip>
      )}

      {!loading && results.length > 0 && (
        <FlexBox direction="Column" style={{ gap: '0.5rem' }}>
          <Text>{results.length} results found</Text>
          {results.map((result, index) => (
            <Card
              key={index}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/forms/${result.formSlug}`)}
            >
              <CardHeader
                titleText={result.formName}
                subtitleText={`Submission: ${result.submissionId?.slice(0, 8)}...`}
                avatar={<Icon name="document" />}
              />
            </Card>
          ))}
        </FlexBox>
      )}
    </FlexBox>
  );
}

export default SearchPage;
```

### Step 9: Delete old Navbar
Delete file: src/components/Navbar.tsx (no longer needed)

---

## After All Changes

Run in WSL:
```bash
cd /mnt/d/Worklab/SAP/AI/apex
docker compose up -d --build apex-frontend
```

Test at: http://localhost:3000

---

## Expected Result
- SAP Fiori ShellBar at top
- Card-based forms list
- ObjectPage for form details
- Clean table for submissions
- Fiori-styled search page
