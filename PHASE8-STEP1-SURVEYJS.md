# Phase 8 Step 1: Replace Form.io with SurveyJS

## Objective
Replace Form.io with SurveyJS for better RTL support, easier theming, and enterprise features.

## Why SurveyJS
- Native RTL/Persian support
- MIT license (free for enterprise)
- Easy theming to match SAP Fiori
- Better React integration
- Cleaner API

---

## Step 1: Install Dependencies

```bash
cd frontend
npm uninstall @formio/react formiojs
npm install survey-core survey-react-ui
```

## Step 2: Create SurveyJS Theme (SAP Fiori Style)

Create `frontend/src/styles/surveyjs-fiori-theme.css`:

```css
/* SurveyJS SAP Fiori Theme */
.sd-root-modern {
  --primary: #0a6ed1;
  --primary-light: rgba(10, 110, 209, 0.1);
  --background: #ffffff;
  --background-dim: #f7f7f7;
  --foreground: #32363a;
  --foreground-light: #6a6d70;
  --border: #e5e5e5;
  --border-light: #ededed;
  --error: #bb0000;
  --success: #107e3e;
  --warning: #e9730c;
  
  --font-family: "72", "72full", Arial, Helvetica, sans-serif;
  --font-size: 14px;
  
  direction: rtl;
}

/* Input fields - Fiori style */
.sd-input {
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: var(--font-size);
  font-family: var(--font-family);
  transition: border-color 0.2s;
}

.sd-input:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-light);
}

.sd-input:hover {
  border-color: var(--primary);
}

/* Labels */
.sd-question__title {
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 0.5rem;
}

.sd-question__required-text {
  color: var(--error);
}

/* Panels/Sections */
.sd-panel {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.sd-panel__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

/* Dropdown/Select */
.sd-dropdown {
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  background: var(--background);
  cursor: pointer;
}

.sd-dropdown:hover {
  border-color: var(--primary);
}

/* Buttons */
.sd-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.sd-btn--action {
  background: var(--primary);
  color: white;
  border: none;
}

.sd-btn--action:hover {
  background: #085cad;
}

.sd-navigation__complete-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-weight: 600;
}

/* Error state */
.sd-question--error .sd-input {
  border-color: var(--error);
}

.sd-question__erbox {
  color: var(--error);
  font-size: 12px;
  margin-top: 0.25rem;
}

/* RTL specific */
[dir="rtl"] .sd-question__title {
  text-align: right;
}

[dir="rtl"] .sd-input {
  text-align: right;
}

/* Date picker */
.sd-input[type="date"] {
  padding: 0.5rem 0.75rem;
}

/* Checkbox & Radio */
.sd-selectbase__item {
  padding: 0.25rem 0;
}

.sd-item__control-label {
  margin-right: 0.5rem;
  margin-left: 0;
}

[dir="rtl"] .sd-item__control-label {
  margin-left: 0.5rem;
  margin-right: 0;
}

/* Page/Wizard navigation */
.sd-progress {
  background: var(--background-dim);
  border-radius: 4px;
  margin-bottom: 1rem;
}

.sd-progress__bar {
  background: var(--primary);
  border-radius: 4px;
}
```

## Step 3: Create Schema Converter

Update `frontend/src/utils/schemaConverter.ts`:

```typescript
/**
 * Convert our internal schema format to SurveyJS format
 */

interface InternalField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'select' | 'checkbox' | 'file';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

interface InternalSchema {
  components: InternalField[];
}

interface SurveyJSQuestion {
  type: string;
  name: string;
  title: string;
  isRequired?: boolean;
  placeholder?: string;
  inputType?: string;
  choices?: string[];
  validators?: any[];
  rows?: number;
}

interface SurveyJSSchema {
  title?: string;
  description?: string;
  logoPosition?: string;
  pages: {
    name: string;
    elements: SurveyJSQuestion[];
  }[];
  showQuestionNumbers?: boolean;
  questionErrorLocation?: string;
  completeText?: string;
}

const typeMapping: Record<string, { type: string; inputType?: string }> = {
  text: { type: 'text' },
  textarea: { type: 'comment' },
  number: { type: 'text', inputType: 'number' },
  email: { type: 'text', inputType: 'email' },
  date: { type: 'text', inputType: 'date' },
  select: { type: 'dropdown' },
  checkbox: { type: 'boolean' },
  file: { type: 'file' },
};

export function convertToSurveyJS(
  schema: InternalSchema,
  formTitle?: string,
  formDescription?: string
): SurveyJSSchema {
  const elements: SurveyJSQuestion[] = schema.components.map((field) => {
    const mapping = typeMapping[field.type] || { type: 'text' };
    
    const question: SurveyJSQuestion = {
      type: mapping.type,
      name: field.name,
      title: field.label,
      isRequired: field.required,
      placeholder: field.placeholder,
    };

    if (mapping.inputType) {
      question.inputType = mapping.inputType;
    }

    if (field.type === 'select' && field.options) {
      question.choices = field.options;
    }

    if (field.type === 'textarea') {
      question.rows = 4;
    }

    // Add validators if validation rules exist
    if (field.validation) {
      question.validators = [];
      
      if (field.validation.pattern) {
        question.validators.push({
          type: 'regex',
          regex: field.validation.pattern,
          text: 'فرمت وارد شده صحیح نیست',
        });
      }
      
      if (field.validation.minLength) {
        question.validators.push({
          type: 'text',
          minLength: field.validation.minLength,
          text: `حداقل ${field.validation.minLength} کاراکتر`,
        });
      }
    }

    return question;
  });

  return {
    title: formTitle,
    description: formDescription,
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements,
      },
    ],
    showQuestionNumbers: false,
    questionErrorLocation: 'bottom',
    completeText: 'ثبت',
  };
}

/**
 * Convert Formio schema (existing forms) to SurveyJS
 */
export function convertFormioToSurveyJS(formioSchema: any): SurveyJSSchema {
  const formioTypeMap: Record<string, string> = {
    textfield: 'text',
    textarea: 'textarea',
    number: 'number',
    email: 'email',
    datetime: 'date',
    day: 'date',
    select: 'select',
    checkbox: 'checkbox',
    file: 'file',
  };

  const components: InternalField[] = (formioSchema.components || [])
    .filter((c: any) => c.type !== 'button')
    .map((c: any) => ({
      name: c.key,
      type: formioTypeMap[c.type] || 'text',
      label: c.label || c.key,
      required: c.validate?.required || false,
      options: c.data?.values?.map((v: any) => v.label),
      placeholder: c.placeholder,
    }));

  return convertToSurveyJS({ components });
}
```

## Step 4: Create SurveyJS Form Renderer

Create `frontend/src/components/SurveyFormRenderer.tsx`:

```tsx
import { useCallback } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/defaultV2.min.css';
import '../styles/surveyjs-fiori-theme.css';

// Set RTL and Persian locale
import { surveyLocalization } from 'survey-core';

// Persian translations
surveyLocalization.locales['fa'] = {
  pagePrevText: 'قبلی',
  pageNextText: 'بعدی',
  completeText: 'ثبت',
  requiredError: 'این فیلد الزامی است',
  loadingFile: 'در حال بارگذاری...',
  chooseFileCaption: 'انتخاب فایل',
  removeFileCaption: 'حذف',
  emptyMessage: 'داده‌ای موجود نیست',
};

surveyLocalization.currentLocale = 'fa';

interface SurveyFormRendererProps {
  schema: any;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  readOnly?: boolean;
  initialData?: Record<string, any>;
}

export function SurveyFormRenderer({
  schema,
  onSubmit,
  onCancel,
  loading,
  readOnly,
  initialData,
}: SurveyFormRendererProps) {
  const survey = new Model(schema);
  
  // Set RTL
  survey.locale = 'fa';
  
  // Apply initial data if provided
  if (initialData) {
    survey.data = initialData;
  }
  
  // Set read-only mode
  if (readOnly) {
    survey.mode = 'display';
  }

  const handleComplete = useCallback(
    (sender: any) => {
      onSubmit(sender.data);
    },
    [onSubmit]
  );

  survey.onComplete.add(handleComplete);

  return (
    <div dir="rtl" style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
      <Survey model={survey} />
      {onCancel && (
        <div style={{ marginTop: '1rem', textAlign: 'left' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid #e5e5e5',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            انصراف
          </button>
        </div>
      )}
    </div>
  );
}
```

## Step 5: Update FormPage.tsx

Update `frontend/src/pages/FormPage.tsx` to use SurveyFormRenderer instead of FioriFormRenderer:

```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FlexBox,
  Title,
  Text,
  Tag,
  Button,
  BusyIndicator,
  MessageStrip,
  Card
} from '@ui5/webcomponents-react';
import "@ui5/webcomponents-icons/dist/response.js";
import "@ui5/webcomponents-icons/dist/nav-back.js";
import { SurveyFormRenderer } from '../components/SurveyFormRenderer';
import { convertFormioToSurveyJS } from '../utils/schemaConverter';
import { formsApi } from '../services/api';
import { Form } from '../types';

function FormPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      setError('فرم یافت نشد');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setSubmitting(true);
    try {
      await formsApi.submit(slug!, data);
      setSubmitted(true);
    } catch (err) {
      setError('خطا در ثبت فرم');
    } finally {
      setSubmitting(false);
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
      <FlexBox direction="Column" style={{ padding: '1rem', gap: '1rem' }}>
        <MessageStrip design="Negative">{error || 'فرم یافت نشد'}</MessageStrip>
        <Button icon="nav-back" onClick={() => navigate('/forms')}>بازگشت</Button>
      </FlexBox>
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
        <MessageStrip design="Positive" hideCloseButton>
          فرم با موفقیت ثبت شد!
        </MessageStrip>
        <FlexBox style={{ gap: '0.5rem' }}>
          <Button design="Emphasized" onClick={() => navigate('/forms')}>
            بازگشت به فرم‌ها
          </Button>
          <Button design="Transparent" onClick={() => setSubmitted(false)}>
            ثبت مجدد
          </Button>
        </FlexBox>
      </FlexBox>
    );
  }

  // Convert Formio schema to SurveyJS
  const surveySchema = convertFormioToSurveyJS(form.schema);
  surveySchema.title = form.name;
  surveySchema.description = form.description;

  return (
    <FlexBox direction="Column" style={{ gap: '1rem', padding: '1rem' }}>
      {/* Header */}
      <FlexBox justifyContent="SpaceBetween" alignItems="Center">
        <FlexBox alignItems="Center" style={{ gap: '1rem' }}>
          <Button icon="nav-back" design="Transparent" onClick={() => navigate('/forms')} />
          <FlexBox direction="Column">
            <Title level="H2">{form.name}</Title>
            <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
              <Text>{form.description || ''}</Text>
              <Tag>{form.status}</Tag>
            </FlexBox>
          </FlexBox>
        </FlexBox>
        <Button
          icon="response"
          design="Transparent"
          onClick={() => navigate(`/forms/${slug}/submissions`)}
        >
          مشاهده ثبت‌ها
        </Button>
      </FlexBox>

      {/* Form */}
      <Card>
        <SurveyFormRenderer
          schema={surveySchema}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/forms')}
          loading={submitting}
        />
      </Card>
    </FlexBox>
  );
}

export default FormPage;
```

## Step 6: Update main.tsx

Add RTL direction to document:

```tsx
// In main.tsx, add at the top after imports:
document.documentElement.dir = 'rtl';
document.documentElement.lang = 'fa';
```

---

## Files Summary

| File | Action |
|------|--------|
| `frontend/package.json` | Remove formio, add survey-core, survey-react-ui |
| `frontend/src/styles/surveyjs-fiori-theme.css` | CREATE - Fiori theme |
| `frontend/src/utils/schemaConverter.ts` | UPDATE - Add SurveyJS converter |
| `frontend/src/components/SurveyFormRenderer.tsx` | CREATE - New renderer |
| `frontend/src/components/FioriFormRenderer.tsx` | DELETE - No longer needed |
| `frontend/src/pages/FormPage.tsx` | UPDATE - Use SurveyFormRenderer |
| `frontend/src/main.tsx` | UPDATE - Add RTL direction |

---

## Testing

```bash
cd /mnt/d/Worklab/SAP/AI/apex
docker compose up -d --build frontend
```

Then test:
1. http://localhost:3000/forms
2. Open any form
3. Verify RTL layout
4. Verify Fiori styling
5. Submit form

---

## Next Step

After this works, we add **SurveyJS Creator** for visual form builder.
