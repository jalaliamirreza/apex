import { useState } from 'react';
import { FlexBox, Button, Input, Dialog, Bar } from '@ui5/webcomponents-react';
import { PageDef } from '../../types/form-builder';

interface PageTabsProps {
  pages: PageDef[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onRename: (index: number, title: string) => void;
}

export function PageTabs({ pages, selectedIndex, onSelect, onAdd, onRemove, onRename }: PageTabsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null);

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditTitle(pages[index].title);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      onRename(editingIndex, editTitle);
      setEditingIndex(null);
    }
  };

  const handleRemoveClick = (index: number) => {
    if (pages.length === 1) return; // Keep at least one page
    setConfirmRemove(index);
  };

  const handleConfirmRemove = () => {
    if (confirmRemove !== null) {
      onRemove(confirmRemove);
      setConfirmRemove(null);
    }
  };

  return (
    <>
      <FlexBox
        alignItems="Center"
        style={{
          background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          padding: '0.5rem 1rem',
          gap: '0.5rem',
          overflowX: 'auto'
        }}
      >
        {pages.map((page, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 1rem',
              background: selectedIndex === index ? 'white' : 'transparent',
              border: selectedIndex === index ? '1px solid #0a6ed1' : '1px solid transparent',
              borderRadius: '4px',
              cursor: 'pointer',
              minWidth: 'fit-content',
              position: 'relative'
            }}
            onClick={() => onSelect(index)}
          >
            <span style={{ fontWeight: selectedIndex === index ? '600' : '400' }}>
              {page.title}
            </span>
            <Button
              icon="edit"
              design="Transparent"
              onClick={(e) => {
                e.stopPropagation();
                handleStartEdit(index);
              }}
              style={{ minWidth: '2rem', padding: '0.25rem' }}
            />
            {pages.length > 1 && (
              <Button
                icon="decline"
                design="Transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveClick(index);
                }}
                style={{ minWidth: '2rem', padding: '0.25rem' }}
              />
            )}
          </div>
        ))}

        <Button
          icon="add"
          design="Emphasized"
          onClick={onAdd}
          tooltip="Add Page"
          style={{ minWidth: '2.5rem' }}
        />
      </FlexBox>

      {/* Edit Title Dialog */}
      <Dialog
        open={editingIndex !== null}
        headerText="Rename Page"
        footer={
          <Bar
            endContent={
              <>
                <Button onClick={() => setEditingIndex(null)}>Cancel</Button>
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

      {/* Confirm Remove Dialog */}
      <Dialog
        open={confirmRemove !== null}
        headerText="Remove Page"
        footer={
          <Bar
            endContent={
              <>
                <Button onClick={() => setConfirmRemove(null)}>Cancel</Button>
                <Button design="Negative" onClick={handleConfirmRemove}>Remove</Button>
              </>
            }
          />
        }
      >
        <div style={{ padding: '1rem' }}>
          <p>Are you sure you want to remove this page?</p>
          {confirmRemove !== null && pages[confirmRemove]?.elements.length > 0 && (
            <p style={{ color: '#d32f2f', marginTop: '0.5rem' }}>
              This page contains {pages[confirmRemove].elements.length} field(s).
            </p>
          )}
        </div>
      </Dialog>
    </>
  );
}
