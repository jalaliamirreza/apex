# Phase 8 Step 2: Enterprise Fonts & RTL/LTR Support

## Objective
- Use professional fonts: **Vazir** (Persian) + **Inter** (English)
- Make all pages **LTR** by default
- Add **RTL/LTR tag** to forms
- Form content respects its own direction setting

---

## Step 1: Install Fonts

### Option A: Google Fonts CDN (Recommended)
Add to `frontend/index.html`:

```html
<head>
  <!-- Inter (English) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Vazir (Persian) -->
  <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css" rel="stylesheet">
</head>
```

### Option B: NPM Install
```bash
cd frontend
npm install vazir-font
```

Then in CSS:
```css
@import 'vazir-font/dist/font-face.css';
```

---

## Step 2: Update Global Styles

Update `frontend/src/index.css`:

```css
/* Global Font Stack */
:root {
  --font-english: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-persian: 'Vazir', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family: var(--font-english);
  
  /* SAP Fiori Colors */
  --primary: #0a6ed1;
  --primary-hover: #085cad;
  --background: #f7f7f7;
  --surface: #ffffff;
  --text-primary: #32363a;
  --text-secondary: #6a6d70;
  --border: #e5e5e5;
  --error: #bb0000;
  --success: #107e3e;
}

/* Base - LTR Default */
html {
  direction: ltr;
}

body {
  font-family: var(--font-english);
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--background);
  margin: 0;
  padding: 0;
}

/* Persian/RTL Content */
[dir="rtl"],
.rtl,
.persian-text {
  font-family: var(--font-persian);
  direction: rtl;
}

/* Mixed content - detect Persian characters */
.mixed-text {
  font-family: var(--font-persian);
}
```

---

## Step 3: Update main.tsx

Remove RTL from document root:

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// LTR by default (was RTL before)
document.documentElement.dir = 'ltr';
document.documentElement.lang = 'en';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Step 4: Add Direction Field to Form Schema

### Backend: Update Form Model

Add `direction` field to form entity (`backend/src/entities/form.entity.ts`):

```typescript
@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  schema: object;

  @Column({ default: 'ltr' })  // NEW FIELD
  direction: 'ltr' | 'rtl';

  @Column({ default: 'active' })
  status: string;

  // ... rest of fields
}
```

### Backend: Update Form Service

Update `backend/src/services/form.service.ts`:

```typescript
export async function createForm(data: CreateFormDTO, createdBy?: string) {
  const { name, description, fields, direction = 'ltr' } = data;
  
  // Detect direction from name if not specified
  const detectedDirection = direction || detectDirection(name);
  
  const form = formRepo.create({
    name,
    slug: slugify(name),
    description,
    schema: buildFormioSchema(fields),
    direction: detectedDirection,
    createdBy,
  });
  
  return formRepo.save(form);
}

// Helper to detect Persian/Arabic text
function detectDirection(text: string): 'ltr' | 'rtl' {
  const persianRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return persianRegex.test(text) ? 'rtl' : 'ltr';
}
```

### Backend: Update API Response

Form API should return `direction` field.

---

## Step 5: Update Frontend Components

### FormsListPage.tsx - Add Direction Tag

```tsx
import { Tag } from '@ui5/webcomponents-react';

// In form card/tile:
<FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
  <Tag colorScheme={form.direction === 'rtl' ? '6' : '8'}>
    {form.direction === 'rtl' ? 'فارسی' : 'English'}
  </Tag>
  <Tag>{form.status}</Tag>
</FlexBox>
```

### FormPage.tsx - Apply Direction to Form Content

```tsx
function FormPage() {
  const [form, setForm] = useState<Form | null>(null);
  
  // ... loading logic
  
  return (
    <FlexBox direction="Column" style={{ gap: '1rem', padding: '1rem' }}>
      {/* Header - Always LTR */}
      <FlexBox justifyContent="SpaceBetween" alignItems="Center">
        <FlexBox alignItems="Center" style={{ gap: '1rem' }}>
          <Button icon="nav-back" design="Transparent" onClick={() => navigate('/forms')} />
          <FlexBox direction="Column">
            <Title level="H2">{form.name}</Title>
            <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
              <Text>{form.description}</Text>
              <Tag colorScheme={form.direction === 'rtl' ? '6' : '8'}>
                {form.direction === 'rtl' ? 'فارسی' : 'English'}
              </Tag>
              <Tag>{form.status}</Tag>
            </FlexBox>
          </FlexBox>
        </FlexBox>
      </FlexBox>

      {/* Form Content - Respects form direction */}
      <Card>
        <div 
          dir={form.direction} 
          style={{ 
            fontFamily: form.direction === 'rtl' ? 'var(--font-persian)' : 'var(--font-english)' 
          }}
        >
          <SurveyFormRenderer
            schema={surveySchema}
            onSubmit={handleSubmit}
            direction={form.direction}
          />
        </div>
      </Card>
    </FlexBox>
  );
}
```

### SurveyFormRenderer.tsx - Support Direction Prop

```tsx
interface SurveyFormRendererProps {
  schema: any;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
  initialData?: Record<string, any>;
  direction?: 'ltr' | 'rtl';  // NEW
}

export function SurveyFormRenderer({
  schema,
  onSubmit,
  direction = 'ltr',  // Default LTR
  ...props
}: SurveyFormRendererProps) {
  const survey = new Model(schema);
  
  // Set locale based on direction
  survey.locale = direction === 'rtl' ? 'fa' : 'en';
  
  return (
    <div 
      dir={direction} 
      style={{ 
        fontFamily: direction === 'rtl' ? 'var(--font-persian)' : 'var(--font-english)',
        background: 'white', 
        borderRadius: '8px', 
        padding: '1rem' 
      }}
    >
      <Survey model={survey} />
    </div>
  );
}
```

---

## Step 6: Update SurveyJS Theme

Update `frontend/src/styles/surveyjs-fiori-theme.css`:

```css
/* SurveyJS SAP Fiori Theme */
.sd-root-modern {
  --primary: #0a6ed1;
  --font-family: var(--font-english);
  
  /* Remove forced RTL - let parent control */
  /* direction: rtl; -- REMOVE THIS */
}

/* RTL specific styles */
[dir="rtl"] .sd-root-modern {
  --font-family: var(--font-persian);
}

[dir="rtl"] .sd-question__title {
  text-align: right;
}

[dir="rtl"] .sd-input {
  text-align: right;
}

/* LTR specific styles */
[dir="ltr"] .sd-question__title {
  text-align: left;
}

[dir="ltr"] .sd-input {
  text-align: left;
}
```

---

## Step 7: Update MCP Server

Update `mcp-server/src/tools/forms.ts` to accept direction:

```typescript
const createFormTool = {
  name: 'create_form',
  description: 'Create a new form',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      fields: { type: 'array' },
      direction: { 
        type: 'string', 
        enum: ['ltr', 'rtl'],
        description: 'Form direction - rtl for Persian/Arabic, ltr for English'
      }
    },
    required: ['name', 'fields']
  }
};
```

---

## Files Summary

| File | Action |
|------|--------|
| `frontend/index.html` | ADD font imports |
| `frontend/src/index.css` | UPDATE global styles |
| `frontend/src/main.tsx` | CHANGE to LTR default |
| `frontend/src/styles/surveyjs-fiori-theme.css` | UPDATE for direction |
| `frontend/src/components/SurveyFormRenderer.tsx` | ADD direction prop |
| `frontend/src/pages/FormPage.tsx` | ADD direction tag & styling |
| `frontend/src/pages/FormsListPage.tsx` | ADD direction tag |
| `backend/src/entities/form.entity.ts` | ADD direction field |
| `backend/src/services/form.service.ts` | ADD direction detection |
| `mcp-server/src/tools/forms.ts` | ADD direction param |

---

## Database Migration

Run after backend changes:
```bash
docker compose exec backend npm run migration:generate -- AddFormDirection
docker compose exec backend npm run migration:run
```

Or manually add column:
```sql
ALTER TABLE forms ADD COLUMN direction VARCHAR(3) DEFAULT 'ltr';
```

---

## Testing

After implementation:
```bash
docker compose up -d --build
```

Test:
1. http://localhost:3000 - Should be LTR
2. Create English form - Should show "English" tag
3. Create Persian form - Should show "فارسی" tag  
4. Open Persian form - Form content should be RTL with Vazir font
5. Open English form - Form content should be LTR with Inter font

---

## Expected Result

| Page | Direction | Font |
|------|-----------|------|
| Shell/Navigation | LTR | Inter |
| Forms List | LTR | Inter |
| English Form Content | LTR | Inter |
| Persian Form Content | RTL | Vazir |
| Form Tags | Show "English" or "فارسی" | - |
