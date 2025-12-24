import { FlexBox, Button, Input, Label, CheckBox, Title } from '@ui5/webcomponents-react';
import { FieldDef } from '../../types/form-builder';

interface FieldConfigPanelProps {
  field: FieldDef | null;
  onChange: (updates: Partial<FieldDef>) => void;
}

export function FieldConfigPanel({ field, onChange }: FieldConfigPanelProps) {
  if (!field) {
    return (
      <div
        style={{
          padding: '2rem',
          background: 'white',
          borderLeft: '1px solid #e5e7eb',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280'
        }}
      >
        Select a field to configure its properties
      </div>
    );
  }

  const hasChoices = ['dropdown', 'radiogroup', 'tagbox'].includes(field.type);
  const hasInputType = field.type === 'text';
  const hasRating = field.type === 'rating';
  const hasFile = field.type === 'file';

  const addChoice = () => {
    const newChoices = [...(field.choices || [])];
    const nextNum = newChoices.length + 1;
    newChoices.push({ value: `option${nextNum}`, text: `Option ${nextNum}` });
    onChange({ choices: newChoices });
  };

  const updateChoice = (index: number, key: 'value' | 'text', value: string) => {
    const newChoices = [...(field.choices || [])];
    newChoices[index] = { ...newChoices[index], [key]: value };
    onChange({ choices: newChoices });
  };

  const removeChoice = (index: number) => {
    const newChoices = field.choices?.filter((_, i) => i !== index) || [];
    onChange({ choices: newChoices });
  };

  return (
    <div
      style={{
        padding: '1rem',
        background: 'white',
        borderLeft: '1px solid #e5e7eb',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      <Title level="H5" style={{ marginBottom: '1rem' }}>Field Properties</Title>

      <FlexBox direction="Column" style={{ gap: '1rem' }}>
        {/* Field Label */}
        <div>
          <Label required>Label</Label>
          <Input
            value={field.title}
            onInput={(e: any) => onChange({ title: e.target.value })}
            style={{ width: '100%' }}
          />
        </div>

        {/* Field Name */}
        <div>
          <Label required>Name</Label>
          <Input
            value={field.name}
            onInput={(e: any) => onChange({ name: e.target.value })}
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Unique identifier for this field
          </div>
        </div>

        {/* Required Checkbox */}
        <div>
          <CheckBox
            checked={field.isRequired || false}
            onChange={(e: any) => onChange({ isRequired: e.target.checked })}
            text="Required field"
          />
        </div>

        {/* Placeholder (for text types) */}
        {(field.type === 'text' || field.type === 'comment') && (
          <div>
            <Label>Placeholder</Label>
            <Input
              value={field.placeholder || ''}
              onInput={(e: any) => onChange({ placeholder: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
        )}

        {/* Input Type (for text field) */}
        {hasInputType && (
          <div>
            <Label>Input Type</Label>
            <select
              value={field.inputType || 'text'}
              onChange={(e) => onChange({ inputType: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: 'white',
                fontSize: '0.875rem'
              }}
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="tel">Phone</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="url">URL</option>
            </select>
          </div>
        )}

        {/* Choices Editor */}
        {hasChoices && (
          <div>
            <Label>Choices</Label>
            <FlexBox direction="Column" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
              {(field.choices || []).map((choice, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    background: '#f9fafb',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Input
                      value={choice.value}
                      onInput={(e: any) => updateChoice(index, 'value', e.target.value)}
                      placeholder="Value"
                      style={{ width: '100%', marginBottom: '0.25rem' }}
                    />
                    <Input
                      value={choice.text}
                      onInput={(e: any) => updateChoice(index, 'text', e.target.value)}
                      placeholder="Display Text"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <Button
                    icon="delete"
                    design="Transparent"
                    onClick={() => removeChoice(index)}
                    style={{ alignSelf: 'center' }}
                  />
                </div>
              ))}

              <Button
                icon="add"
                design="Transparent"
                onClick={addChoice}
                style={{
                  width: '100%',
                  border: '1px dashed #0a6ed1',
                  color: '#0a6ed1'
                }}
              >
                Add Option
              </Button>
            </FlexBox>
          </div>
        )}

        {/* Rating Count */}
        {hasRating && (
          <div>
            <Label>Number of Stars</Label>
            <Input
              type="Number"
              value={String(field.rateCount || 5)}
              onInput={(e: any) => onChange({ rateCount: parseInt(e.target.value) || 5 })}
              style={{ width: '100%' }}
            />
          </div>
        )}

        {/* File Types */}
        {hasFile && (
          <div>
            <Label>Accepted File Types</Label>
            <Input
              value={field.acceptedTypes || ''}
              onInput={(e: any) => onChange({ acceptedTypes: e.target.value })}
              placeholder="e.g., .pdf,.doc,.docx"
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Comma-separated list of file extensions
            </div>
          </div>
        )}
      </FlexBox>
    </div>
  );
}
