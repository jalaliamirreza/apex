# APEX Form Renderer - SAP UI5 Native Components

## Problem
Current form rendering uses Formio.js which has unstyled, ugly form fields that don't match SAP Fiori design. Forms look unprofessional with:
- No input borders
- Dropdowns always expanded
- No Fiori styling
- Inconsistent with rest of app

## Solution
Replace Formio.js renderer with native `@ui5/webcomponents-react` form components.

## Reference Design
SAP Fiori form layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Form Title                                    [SubmitBtn]  │
│ Description                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Label *                          Label                     │
│  ┌─────────────────────┐         ┌─────────────────────┐   │
│  │ Input value         │         │ Input value         │   │
│  └─────────────────────┘         └─────────────────────┘   │
│                                                             │
│  Label *                          Label                     │
│  ┌─────────────────────┐         ┌─────────────────────┐   │
│  │ Select...         ▼ │         │ DD/MM/YYYY       📅 │   │
│  └─────────────────────┘         └─────────────────────┘   │
│                                                             │
│  Label                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Textarea...                                         │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ☑ Checkbox label                                          │
│                                                             │
│                                        [Cancel] [Submit]    │
└─────────────────────────────────────────────────────────────┘
```

## UI5 Components to Use

| Field Type | UI5 Component | Import |
|------------|---------------|--------|
| text | `<Input />` | @ui5/webcomponents-react |
| textarea | `<TextArea />` | @ui5/webcomponents-react |
| number | `<Input type="Number" />` | @ui5/webcomponents-react |
| email | `<Input type="Email" />` | @ui5/webcomponents-react |
| date | `<DatePicker />` | @ui5/webcomponents-react |
| select | `<Select><Option /></Select>` | @ui5/webcomponents-react |
| checkbox | `<CheckBox />` | @ui5/webcomponents-react |
| file | `<FileUploader />` | @ui5/webcomponents-react |
| signature | Custom canvas (later) | - |

## Form Layout Components

```jsx
import {
  Form,
  FormGroup,
  FormItem,
  Input,
  TextArea,
  Select,
  Option,
  DatePicker,
  CheckBox,
  Button,
  Label,
  FlexBox,
  MessageStrip
} from '@ui5/webcomponents-react';
```

## Implementation

### 1. Create New Component: `frontend/src/components/FioriFormRenderer.tsx`

```tsx
import { useState } from 'react';
import {
  Form,
  FormGroup,
  FormItem,
  Input,
  TextArea,
  Select,
  Option,
  DatePicker,
  CheckBox,
  Button,
  FlexBox,
  Label,
  InputType
} from '@ui5/webcomponents-react';

interface FormField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'select' | 'checkbox' | 'file';
  label: string;
  required?: boolean;
  options?: string[]; // For select fields
  placeholder?: string;
}

interface FormSchema {
  components: FormField[];
}

interface FioriFormRendererProps {
  schema: FormSchema;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function FioriFormRenderer({ schema, onSubmit, onCancel, loading }: FioriFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    schema.components.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      value: formData[field.name] || '',
      valueState: errors[field.name] ? 'Error' : 'None',
      valueStateMessage: errors[field.name] ? <span>{errors[field.name]}</span> : undefined,
    };

    switch (field.type) {
      case 'text':
        return (
          <Input
            {...commonProps}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            onInput={(e: any) => handleChange(field.name, e.target.value)}
            style={{ width: '100%' }}
          />
        );

      case 'email':
        return (
          <Input
            {...commonProps}
            type={InputType.Email}
            placeholder={field.placeholder || 'email@example.com'}
            onInput={(e: any) => handleChange(field.name, e.target.value)}
            style={{ width: '100%' }}
          />
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type={InputType.Number}
            placeholder={field.placeholder || '0'}
            onInput={(e: any) => handleChange(field.name, e.target.value)}
            style={{ width: '100%' }}
          />
        );

      case 'textarea':
        return (
          <TextArea
            value={formData[field.name] || ''}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            onInput={(e: any) => handleChange(field.name, e.target.value)}
            rows={4}
            style={{ width: '100%' }}
            valueState={errors[field.name] ? 'Error' : 'None'}
          />
        );

      case 'date':
        return (
          <DatePicker
            value={formData[field.name] || ''}
            onChange={(e: any) => handleChange(field.name, e.detail.value)}
            style={{ width: '100%' }}
            valueState={errors[field.name] ? 'Error' : 'None'}
          />
        );

      case 'select':
        return (
          <Select
            onChange={(e: any) => handleChange(field.name, e.detail.selectedOption?.textContent)}
            style={{ width: '100%' }}
            valueState={errors[field.name] ? 'Error' : 'None'}
          >
            <Option value="">Select {field.label}...</Option>
            {field.options?.map(opt => (
              <Option key={opt} value={opt}>{opt}</Option>
            ))}
          </Select>
        );

      case 'checkbox':
        return (
          <CheckBox
            checked={formData[field.name] || false}
            text={field.label}
            onChange={(e: any) => handleChange(field.name, e.target.checked)}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            onInput={(e: any) => handleChange(field.name, e.target.value)}
            style={{ width: '100%' }}
          />
        );
    }
  };

  return (
    <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
      <Form
        columnsL={2}
        columnsM={1}
        columnsS={1}
        columnsXL={2}
        labelSpanL={12}
        labelSpanM={12}
        labelSpanS={12}
        labelSpanXL={12}
        style={{ paddingBottom: '1rem' }}
      >
        <FormGroup titleText="Form Details">
          {schema.components
            .filter(f => f.type !== 'checkbox')
            .map(field => (
              <FormItem key={field.name} label={`${field.label}${field.required ? ' *' : ''}`}>
                {renderField(field)}
              </FormItem>
            ))}
        </FormGroup>

        {/* Checkboxes separately */}
        {schema.components.filter(f => f.type === 'checkbox').map(field => (
          <FormItem key={field.name}>
            {renderField(field)}
          </FormItem>
        ))}
      </Form>

      <FlexBox justifyContent="End" style={{ gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e5e5' }}>
        {onCancel && (
          <Button design="Transparent" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button design="Emphasized" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </FlexBox>
    </div>
  );
}
```

### 2. Create Schema Converter: `frontend/src/utils/schemaConverter.ts`

Convert Formio schema to our simplified schema:

```tsx
interface FormioComponent {
  type: string;
  key: string;
  label: string;
  validate?: { required?: boolean };
  data?: { values?: { label: string; value: string }[] };
  placeholder?: string;
}

interface FormioSchema {
  components: FormioComponent[];
}

interface SimpleField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'select' | 'checkbox' | 'file';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export function convertFormioSchema(formioSchema: FormioSchema): { components: SimpleField[] } {
  const typeMap: Record<string, SimpleField['type']> = {
    textfield: 'text',
    textarea: 'textarea',
    number: 'number',
    email: 'email',
    datetime: 'date',
    day: 'date',
    select: 'select',
    checkbox: 'checkbox',
    file: 'file',
    // Add more mappings as needed
  };

  const components: SimpleField[] = formioSchema.components
    .filter(c => c.type !== 'button') // Skip submit buttons
    .map(c => ({
      name: c.key,
      type: typeMap[c.type] || 'text',
      label: c.label || c.key,
      required: c.validate?.required || false,
      options: c.data?.values?.map(v => v.label),
      placeholder: c.placeholder,
    }));

  return { components };
}
```

### 3. Update FormPage.tsx

Replace Formio renderer with FioriFormRenderer:

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
import { FioriFormRenderer } from '../components/FioriFormRenderer';
import { convertFormioSchema } from '../utils/schemaConverter';
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
      setError('Failed to load form');
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
      setError('Failed to submit form');
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
        <MessageStrip design="Negative">{error || 'Form not found'}</MessageStrip>
        <Button icon="nav-back" onClick={() => navigate('/forms')}>Back to Forms</Button>
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
          Form submitted successfully!
        </MessageStrip>
        <FlexBox style={{ gap: '0.5rem' }}>
          <Button design="Emphasized" onClick={() => navigate('/forms')}>
            Back to Forms
          </Button>
          <Button design="Transparent" onClick={() => setSubmitted(false)}>
            Submit Another
          </Button>
        </FlexBox>
      </FlexBox>
    );
  }

  // Convert Formio schema to simple schema
  const simpleSchema = convertFormioSchema(form.schema);

  return (
    <FlexBox direction="Column" style={{ gap: '1rem', padding: '1rem' }}>
      {/* Header */}
      <FlexBox justifyContent="SpaceBetween" alignItems="Center">
        <FlexBox alignItems="Center" style={{ gap: '1rem' }}>
          <Button icon="nav-back" design="Transparent" onClick={() => navigate('/forms')} />
          <FlexBox direction="Column">
            <Title level="H2">{form.name}</Title>
            <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
              <Text>{form.description || 'No description'}</Text>
              <Tag>{form.status}</Tag>
            </FlexBox>
          </FlexBox>
        </FlexBox>
        <Button
          icon="response"
          design="Transparent"
          onClick={() => navigate(`/forms/${slug}/submissions`)}
        >
          View Submissions
        </Button>
      </FlexBox>

      {/* Form */}
      <Card>
        <FioriFormRenderer
          schema={simpleSchema}
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

### 4. Remove Formio.js Dependencies (Optional - can keep for schema generation)

If you want to fully remove Formio.js:
```bash
npm uninstall @formio/react formiojs
```

But we should keep it for now since the backend uses Formio schema format.

## Files to Create/Update

| File | Action |
|------|--------|
| `frontend/src/components/FioriFormRenderer.tsx` | CREATE |
| `frontend/src/utils/schemaConverter.ts` | CREATE |
| `frontend/src/pages/FormPage.tsx` | UPDATE |

## Testing

After implementation:
```bash
cd /mnt/d/Worklab/SAP/AI/apex
docker compose up -d --build frontend
```

Then test:
1. Navigate to http://localhost:3000/forms
2. Click on any form
3. Verify Fiori-styled form fields
4. Fill and submit form
5. Check submissions page

## Expected Result

Forms should look like proper SAP Fiori forms with:
- Bordered input fields
- Proper dropdowns (collapsed by default)
- Date pickers with calendar icon
- Validation error states
- Submit/Cancel buttons
- Consistent styling with rest of app
