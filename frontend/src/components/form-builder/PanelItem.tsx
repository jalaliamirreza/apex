import { useState } from 'react';
import { FlexBox, Button, Icon, Dialog, Bar, Input } from '@ui5/webcomponents-react';
import { PanelDef, FieldPath } from '../../types/form-builder';
import { FieldItem } from './FieldItem';

interface PanelItemProps {
  panel: PanelDef;
  pageIndex: number;
  panelIndex: number;
  selectedField: FieldPath | null;
  onSelectField: (path: FieldPath) => void;
  onMovePanel: (direction: 'up' | 'down') => void;
  onRemovePanel: () => void;
  onRenamePanel: (title: string) => void;
  onMoveField: (path: FieldPath, direction: 'up' | 'down') => void;
  onRemoveField: (path: FieldPath) => void;
  onAddFieldToPanel: () => void;
}

export function PanelItem({
  panel,
  pageIndex,
  panelIndex,
  selectedField,
  onSelectField,
  onMovePanel,
  onRemovePanel,
  onRenamePanel,
  onMoveField,
  onRemoveField,
  onAddFieldToPanel
}: PanelItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = () => {
    setEditTitle(panel.title);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onRenamePanel(editTitle);
    setIsEditing(false);
  };

  const isFieldSelected = (path: FieldPath): boolean => {
    if (!selectedField) return false;
    return (
      selectedField.pageIndex === path.pageIndex &&
      selectedField.panelIndex === path.panelIndex &&
      selectedField.fieldIndex === path.fieldIndex
    );
  };

  return (
    <>
      <div
        style={{
          background: 'white',
          border: '2px solid #0a6ed1',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {/* Panel Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.75rem',
            background: '#e3f2fd',
            gap: '0.5rem'
          }}
        >
          <Button
            icon={isExpanded ? 'navigation-down-arrow' : 'navigation-right-arrow'}
            design="Transparent"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ minWidth: '2rem', padding: '0.25rem' }}
          />

          <Icon name="group" style={{ color: '#0a6ed1', fontSize: '1.25rem' }} />

          <div style={{ flex: 1, fontWeight: '600', fontSize: '0.875rem' }}>
            {panel.title}
            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: '400' }}>
              ({panel.elements.length} field{panel.elements.length !== 1 ? 's' : ''})
            </span>
          </div>

          <FlexBox style={{ gap: '0.25rem' }}>
            <Button
              icon="edit"
              design="Transparent"
              onClick={(e) => {
                e.stopPropagation();
                handleStartEdit();
              }}
              style={{ minWidth: '2rem', padding: '0.25rem' }}
            />
            <Button
              icon="navigation-up-arrow"
              design="Transparent"
              onClick={(e) => {
                e.stopPropagation();
                onMovePanel('up');
              }}
              style={{ minWidth: '2rem', padding: '0.25rem' }}
            />
            <Button
              icon="navigation-down-arrow"
              design="Transparent"
              onClick={(e) => {
                e.stopPropagation();
                onMovePanel('down');
              }}
              style={{ minWidth: '2rem', padding: '0.25rem' }}
            />
            <Button
              icon="delete"
              design="Transparent"
              onClick={(e) => {
                e.stopPropagation();
                onRemovePanel();
              }}
              style={{ minWidth: '2rem', padding: '0.25rem' }}
            />
          </FlexBox>
        </div>

        {/* Panel Content */}
        {isExpanded && (
          <div style={{ padding: '1rem', background: '#f9fafb' }}>
            <FlexBox direction="Column" style={{ gap: '0.5rem' }}>
              {panel.elements.length === 0 ? (
                <div
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#6b7280',
                    background: 'white',
                    border: '1px dashed #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                >
                  No fields in this panel yet.
                </div>
              ) : (
                panel.elements.map((field, fieldIndex) => {
                  const path: FieldPath = { pageIndex, panelIndex, fieldIndex };
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
                })
              )}

              <Button
                icon="add"
                design="Transparent"
                onClick={onAddFieldToPanel}
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  border: '1px dashed #0a6ed1',
                  color: '#0a6ed1'
                }}
              >
                Add Field to Panel
              </Button>
            </FlexBox>
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog
        open={isEditing}
        headerText="Rename Panel"
        footer={
          <Bar
            endContent={
              <>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button design="Emphasized" onClick={handleSaveEdit}>Save</Button>
              </>
            }
          />
        }
      >
        <div style={{ padding: '1rem', width: '300px' }}>
          <Input
            value={editTitle}
            onInput={(e: any) => setEditTitle(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </Dialog>
    </>
  );
}
