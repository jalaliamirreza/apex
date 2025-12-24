import { FlexBox, Button } from '@ui5/webcomponents-react';
import { FieldDef, PanelDef, FieldPath } from '../../types/form-builder';
import { FieldItem } from './FieldItem';
import { PanelItem } from './PanelItem';

interface FieldListProps {
  pageIndex: number;
  elements: (PanelDef | FieldDef)[];
  selectedField: FieldPath | null;
  onSelectField: (path: FieldPath) => void;
  onMoveField: (path: FieldPath, direction: 'up' | 'down') => void;
  onRemoveField: (path: FieldPath) => void;
  onMovePanel: (panelIndex: number, direction: 'up' | 'down') => void;
  onRemovePanel: (panelIndex: number) => void;
  onAddFieldToPanel: (panelIndex: number) => void;
}

export function FieldList({
  pageIndex,
  elements,
  selectedField,
  onSelectField,
  onMoveField,
  onRemoveField,
  onMovePanel,
  onRemovePanel,
  onAddFieldToPanel
}: FieldListProps) {
  const isFieldSelected = (path: FieldPath): boolean => {
    if (!selectedField) return false;
    return (
      selectedField.pageIndex === path.pageIndex &&
      selectedField.panelIndex === path.panelIndex &&
      selectedField.fieldIndex === path.fieldIndex
    );
  };

  return (
    <div
      style={{
        padding: '1rem',
        background: '#f9fafb',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      <FlexBox direction="Column" style={{ gap: '0.5rem' }}>
        {elements.length === 0 ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#6b7280',
              background: 'white',
              border: '2px dashed #e5e7eb',
              borderRadius: '8px'
            }}
          >
            No fields yet. Click a field type on the left to add one.
          </div>
        ) : (
          elements.map((element, index) => {
            if ('type' in element && element.type === 'panel') {
              const panel = element as PanelDef;
              return (
                <PanelItem
                  key={panel.name}
                  panel={panel}
                  pageIndex={pageIndex}
                  panelIndex={index}
                  selectedField={selectedField}
                  onSelectField={onSelectField}
                  onMovePanel={(direction) => onMovePanel(index, direction)}
                  onRemovePanel={() => onRemovePanel(index)}
                  onMoveField={onMoveField}
                  onRemoveField={onRemoveField}
                  onAddFieldToPanel={() => onAddFieldToPanel(index)}
                />
              );
            } else {
              const field = element as FieldDef;
              const path: FieldPath = { pageIndex, fieldIndex: index };
              return (
                <FieldItem
                  key={field.name}
                  field={field}
                  path={path}
                  isSelected={isFieldSelected(path)}
                  onSelect={() => onSelectField(path)}
                  onMove={(direction) => onMoveField(path, direction)}
                  onRemove={() => onRemoveField(path)}
                />
              );
            }
          })
        )}
      </FlexBox>
    </div>
  );
}
