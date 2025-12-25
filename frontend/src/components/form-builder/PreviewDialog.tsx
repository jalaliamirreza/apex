import { Dialog, Bar, Button } from '@ui5/webcomponents-react';
import { SurveyFormRenderer } from '../SurveyFormRenderer';

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  schema: object;
  direction: 'ltr' | 'rtl';
  navigationType: string;
}

export function PreviewDialog({ open, onClose, schema, direction, navigationType }: PreviewDialogProps) {
  return (
    <Dialog
      open={open}
      headerText="Form Preview"
      footer={
        <Bar
          endContent={
            <Button design="Emphasized" onClick={onClose}>
              Close
            </Button>
          }
        />
      }
      style={{
        width: '90vw',
        maxWidth: '1200px',
        height: '90vh'
      }}
    >
      <div style={{ padding: '1rem', height: '100%', overflow: 'auto' }}>
        <SurveyFormRenderer
          schema={schema}
          onSubmit={(data) => {
            console.log('Preview form submitted:', data);
            alert('Preview mode - form data logged to console');
          }}
          direction={direction}
          navigationType={navigationType as any}
        />
      </div>
    </Dialog>
  );
}
