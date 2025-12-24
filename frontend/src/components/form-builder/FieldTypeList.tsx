import { FlexBox, Button, Title, Icon } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/AllIcons';

interface FieldTypeListProps {
  onAddField: (type: string) => void;
  onAddPanel: () => void;
}

const FIELD_TYPES = [
  { type: 'text', label: 'Text', icon: 'edit' },
  { type: 'comment', label: 'Textarea', icon: 'document-text' },
  { type: 'number', label: 'Number', icon: 'number-sign' },
  { type: 'email', label: 'Email', icon: 'email' },
  { type: 'phone', label: 'Phone', icon: 'iphone' },
  { type: 'dropdown', label: 'Dropdown', icon: 'dropdown' },
  { type: 'radiogroup', label: 'Radio', icon: 'circle-task-2' },
  { type: 'checkbox', label: 'Checkbox', icon: 'complete' },
  { type: 'tagbox', label: 'Multi-select', icon: 'multi-select' },
  { type: 'date', label: 'Date', icon: 'calendar' },
  { type: 'file', label: 'File Upload', icon: 'attachment' },
  { type: 'rating', label: 'Rating', icon: 'favorite' },
  { type: 'signaturepad', label: 'Signature', icon: 'signature' },
];

export function FieldTypeList({ onAddField, onAddPanel }: FieldTypeListProps) {
  return (
    <div style={{
      padding: '1rem',
      background: 'white',
      borderRight: '1px solid #e5e7eb',
      height: '100%',
      overflowY: 'auto'
    }}>
      <Title level="H5" style={{ marginBottom: '1rem' }}>Field Types</Title>

      <FlexBox direction="Column" style={{ gap: '0.5rem' }}>
        {FIELD_TYPES.map(({ type, label, icon }) => (
          <Button
            key={type}
            icon={icon}
            onClick={() => onAddField(type)}
            design="Transparent"
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              padding: '0.5rem'
            }}
          >
            {label}
          </Button>
        ))}

        <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }} />

        <Button
          icon="group"
          onClick={onAddPanel}
          design="Emphasized"
          style={{
            justifyContent: 'flex-start',
            width: '100%',
            padding: '0.5rem'
          }}
        >
          Panel
        </Button>
      </FlexBox>
    </div>
  );
}
