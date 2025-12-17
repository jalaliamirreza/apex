import { useState } from 'react';
import {
  Input,
  TextArea,
  Select,
  Option,
  DatePicker,
  CheckBox,
  Button,
  FlexBox,
  Label,
  Text
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
      valueState: errors[field.name] ? ('Negative' as const) : ('None' as const),
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
            type="Email"
            placeholder={field.placeholder || 'email@example.com'}
            onInput={(e: any) => handleChange(field.name, e.target.value)}
            style={{ width: '100%' }}
          />
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="Number"
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
            valueState={errors[field.name] ? ('Negative' as const) : ('None' as const)}
          />
        );

      case 'date':
        return (
          <DatePicker
            value={formData[field.name] || ''}
            onChange={(e: any) => handleChange(field.name, e.detail.value)}
            style={{ width: '100%' }}
            valueState={errors[field.name] ? ('Negative' as const) : ('None' as const)}
          />
        );

      case 'select':
        return (
          <Select
            onChange={(e: any) => handleChange(field.name, e.detail.selectedOption?.textContent)}
            style={{ width: '100%' }}
            valueState={errors[field.name] ? ('Negative' as const) : ('None' as const)}
          >
            <Option>Select {field.label}...</Option>
            {field.options?.map(opt => (
              <Option key={opt}>{opt}</Option>
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
    <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px' }}>
      {/* Form Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Text style={{ fontSize: '16px', fontWeight: '600', color: '#32363a' }}>
          Form Details
        </Text>
      </div>

      {/* Form Fields */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          paddingBottom: '1.5rem',
        }}
      >
        {schema.components.map(field => (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {field.type !== 'checkbox' && (
              <Label
                required={field.required}
                style={{ fontSize: '14px', fontWeight: '600', color: '#32363a' }}
              >
                {field.label}
              </Label>
            )}
            {renderField(field)}
            {errors[field.name] && (
              <Text style={{ fontSize: '12px', color: '#bb0000' }}>
                {errors[field.name]}
              </Text>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <FlexBox justifyContent="End" style={{ gap: '0.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e5e5' }}>
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
