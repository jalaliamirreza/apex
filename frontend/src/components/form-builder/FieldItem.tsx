import { FlexBox, Button, Icon } from '@ui5/webcomponents-react';
import { FieldDef, FieldPath } from '../../types/form-builder';

interface FieldItemProps {
  field: FieldDef;
  path: FieldPath;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onRemove: () => void;
}

const getFieldIcon = (type: string): string => {
  const icons: Record<string, string> = {
    text: 'edit',
    comment: 'document-text',
    number: 'number-sign',
    email: 'email',
    phone: 'iphone',
    dropdown: 'dropdown',
    radiogroup: 'circle-task-2',
    checkbox: 'complete',
    tagbox: 'multi-select',
    date: 'calendar',
    file: 'attachment',
    rating: 'favorite',
    signaturepad: 'signature',
  };
  return icons[type] || 'question-mark';
};

const getFieldTypeLabel = (field: FieldDef): string => {
  if (field.inputType) {
    return field.inputType.charAt(0).toUpperCase() + field.inputType.slice(1);
  }
  return field.type.charAt(0).toUpperCase() + field.type.slice(1);
};

export function FieldItem({ field, path, isSelected, onSelect, onMove, onRemove }: FieldItemProps) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem',
        background: isSelected ? '#e3f2fd' : 'white',
        border: isSelected ? '2px solid #0a6ed1' : '1px solid #e5e7eb',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        gap: '0.5rem'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = '#f9fafb';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'white';
        }
      }}
    >
      <Icon name={getFieldIcon(field.type)} style={{ color: '#0a6ed1', fontSize: '1.25rem' }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '500', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {field.title}
          {field.isRequired && <span style={{ color: '#d32f2f' }}> *</span>}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          {field.name}
        </div>
      </div>

      <span
        style={{
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          background: '#f3f4f6',
          color: '#374151',
          fontWeight: '500'
        }}
      >
        {getFieldTypeLabel(field)}
      </span>

      <FlexBox style={{ gap: '0.25rem' }}>
        <Button
          icon="navigation-up-arrow"
          design="Transparent"
          onClick={(e) => {
            e.stopPropagation();
            onMove('up');
          }}
          style={{ minWidth: '2rem', padding: '0.25rem' }}
        />
        <Button
          icon="navigation-down-arrow"
          design="Transparent"
          onClick={(e) => {
            e.stopPropagation();
            onMove('down');
          }}
          style={{ minWidth: '2rem', padding: '0.25rem' }}
        />
        <Button
          icon="delete"
          design="Transparent"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{ minWidth: '2rem', padding: '0.25rem' }}
        />
      </FlexBox>
    </div>
  );
}
