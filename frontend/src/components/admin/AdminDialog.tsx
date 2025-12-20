import { Dialog, Bar, Button, FlexBox } from '@ui5/webcomponents-react';
import { AdminForm } from './AdminForm';
import { FieldConfig } from './types';

interface AdminDialogProps {
  open: boolean;
  title: string;
  fields: FieldConfig[];
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function AdminDialog({
  open,
  title,
  fields,
  data,
  onChange,
  onSave,
  onCancel,
}: AdminDialogProps) {
  return (
    <Dialog
      open={open}
      headerText={title}
      footer={
        <Bar
          endContent={
            <FlexBox style={{ gap: '0.5rem' }}>
              <Button design="Transparent" onClick={onCancel}>
                Cancel
              </Button>
              <Button design="Emphasized" onClick={onSave}>
                Save
              </Button>
            </FlexBox>
          }
        />
      }
    >
      <div style={{ minWidth: '400px' }}>
        <AdminForm fields={fields} data={data} onChange={onChange} />
      </div>
    </Dialog>
  );
}
