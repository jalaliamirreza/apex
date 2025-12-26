import { Dialog, Button, TextArea, Text, BusyIndicator, FlexBox, Bar } from '@ui5/webcomponents-react';
import { useState } from 'react';

interface ApprovalDialogProps {
  isOpen: boolean;
  action: 'approve' | 'reject' | null;
  isLoading: boolean;
  onConfirm: (comments: string) => void;
  onCancel: () => void;
}

export function ApprovalDialog({
  isOpen,
  action,
  isLoading,
  onConfirm,
  onCancel
}: ApprovalDialogProps) {
  const [comments, setComments] = useState('');

  const handleConfirm = () => {
    onConfirm(comments);
    setComments('');
  };

  const handleCancel = () => {
    onCancel();
    setComments('');
  };

  if (!action) return null;

  const isReject = action === 'reject';
  const title = isReject ? 'Reject Request' : 'Approve Request';
  const message = isReject
    ? 'Are you sure you want to reject this request? Please provide a reason.'
    : 'Are you sure you want to approve this request?';

  return (
    <Dialog
      open={isOpen}
      headerText={title}
      footer={
        <Bar
          endContent={
            <>
              <Button onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                design={isReject ? 'Negative' : 'Positive'}
                onClick={handleConfirm}
                disabled={isLoading || (isReject && !comments.trim())}
              >
                {isLoading ? 'Processing...' : 'Confirm'}
              </Button>
            </>
          }
        />
      }
    >
      {isLoading ? (
        <FlexBox
          direction="Column"
          alignItems="Center"
          justifyContent="Center"
          style={{ padding: '2rem' }}
        >
          <BusyIndicator active size="M" />
          <Text style={{ marginTop: '1rem' }}>Processing your request...</Text>
        </FlexBox>
      ) : (
        <div style={{ padding: '1rem', minWidth: '400px' }}>
          <Text style={{ display: 'block', marginBottom: '1rem' }}>
            {message}
          </Text>

          <Text
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '0.5rem',
              display: 'block'
            }}
          >
            Comments {isReject && <span style={{ color: '#b00' }}>*</span>}:
          </Text>
          <TextArea
            value={comments}
            onInput={(e: any) => setComments(e.target.value)}
            rows={4}
            placeholder={
              isReject
                ? 'Please provide a reason for rejection...'
                : 'Add optional comments...'
            }
            style={{ width: '100%' }}
            required={isReject}
          />

          {isReject && !comments.trim() && (
            <Text style={{ color: '#b00', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
              Comments are required for rejection
            </Text>
          )}
        </div>
      )}
    </Dialog>
  );
}
