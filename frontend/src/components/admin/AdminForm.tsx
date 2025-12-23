import {
  Form,
  FormItem,
  Input,
  Switch,
  Select,
  Option,
  TextArea,
} from '@ui5/webcomponents-react';
import { FieldConfig } from './types';

interface AdminFormProps {
  fields: FieldConfig[];
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export function AdminForm({ fields, data, onChange }: AdminFormProps) {
  const renderField = (field: FieldConfig) => {
    const value = data[field.key] ?? '';

    switch (field.type) {
      case 'switch':
        return (
          <Switch
            checked={!!value}
            onChange={(e: any) => onChange(field.key, e.target.checked)}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onChange={(e: any) => onChange(field.key, e.detail.selectedOption.value)}
            style={{ width: '100%' }}
          >
            <Option value="">-- Select --</Option>
            {field.options?.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        );

      case 'textarea':
        return (
          <TextArea
            value={value}
            onInput={(e: any) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            style={{ width: '100%' }}
            rows={4}
          />
        );

      case 'number':
        return (
          <Input
            type="Number"
            value={value}
            onInput={(e: any) => onChange(field.key, Number(e.target.value))}
            placeholder={field.placeholder}
            style={{ width: '100%' }}
          />
        );

      default:
        return (
          <Input
            value={value}
            onInput={(e: any) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            style={{ width: '100%' }}
          />
        );
    }
  };

  return (
    <Form style={{ padding: '1rem' }}>
      {fields.map((field) => (
        <FormItem key={field.key}>
          <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>
            {field.label}{field.required ? ' *' : ''}
          </div>
          {renderField(field)}
        </FormItem>
      ))}
    </Form>
  );
}
