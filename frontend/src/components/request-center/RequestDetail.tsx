import {
  Panel,
  Title,
  Text,
  Button,
  TextArea,
  BusyIndicator,
  FlexBox,
  Icon,
  ObjectStatus
} from '@ui5/webcomponents-react';
import { useState } from 'react';
import { SubmissionDetail } from '../../types/workflow';
import { WorkflowTimeline } from './WorkflowTimeline';

interface RequestDetailProps {
  submission: SubmissionDetail | null;
  isLoading: boolean;
  showActions: boolean;
  onApprove?: (comments: string) => void;
  onReject?: (comments: string) => void;
}

export function RequestDetail({
  submission,
  isLoading,
  showActions,
  onApprove,
  onReject
}: RequestDetailProps) {
  const [comments, setComments] = useState('');

  if (isLoading) {
    return (
      <FlexBox
        direction="Column"
        alignItems="Center"
        justifyContent="Center"
        style={{ padding: '3rem' }}
      >
        <BusyIndicator active size="L" />
      </FlexBox>
    );
  }

  if (!submission) {
    return (
      <FlexBox
        direction="Column"
        alignItems="Center"
        justifyContent="Center"
        style={{ padding: '3rem', textAlign: 'center' }}
      >
        <Icon
          name="document"
          style={{
            fontSize: '4rem',
            color: '#6a6d70',
            marginBottom: '1rem'
          }}
        />
        <Text style={{ fontSize: '1.25rem', fontWeight: 600, color: '#32363a' }}>
          Select a request
        </Text>
        <Text style={{ fontSize: '0.875rem', color: '#6a6d70', marginTop: '0.5rem' }}>
          یک درخواست را انتخاب کنید
        </Text>
      </FlexBox>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; state: any }> = {
      'pending': { text: 'Pending', state: 'Warning' },
      'in_progress': { text: 'In Progress', state: 'Information' },
      'approved': { text: 'Approved', state: 'Success' },
      'rejected': { text: 'Rejected', state: 'Error' }
    };
    return statusMap[status] || { text: status, state: 'None' };
  };

  const statusInfo = getStatusInfo(submission.workflow_status);
  const canTakeAction = showActions && submission.workflow_status === 'in_progress';

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Title level="H3" style={{ marginBottom: '0.5rem' }}>
          {submission.form_name}
        </Title>
        {submission.form_name_fa && (
          <Text style={{ fontSize: '0.875rem', color: '#6a6d70', display: 'block', marginBottom: '0.5rem' }}>
            {submission.form_name_fa}
          </Text>
        )}
        <ObjectStatus state={statusInfo.state}>{statusInfo.text}</ObjectStatus>
      </div>

      {/* Metadata */}
      <Panel headerText="Request Information" style={{ marginBottom: '1rem' }}>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text style={{ color: '#6a6d70', fontSize: '0.875rem' }}>Submitted by:</Text>
            <Text style={{ fontWeight: 500, fontSize: '0.875rem' }}>
              {submission.submitted_by.split('@')[0]}
            </Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text style={{ color: '#6a6d70', fontSize: '0.875rem' }}>Date:</Text>
            <Text style={{ fontSize: '0.875rem' }}>{formatDate(submission.submitted_at)}</Text>
          </div>
          {submission.current_step && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ color: '#6a6d70', fontSize: '0.875rem' }}>Current Step:</Text>
              <Text style={{ fontSize: '0.875rem' }}>
                {submission.current_step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </div>
          )}
        </div>
      </Panel>

      {/* Form Data */}
      <Panel headerText="Form Data" style={{ marginBottom: '1rem' }}>
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Object.entries(submission.data).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Text style={{ color: '#6a6d70', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                {key.replace(/_/g, ' ')}:
              </Text>
              <Text style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {String(value)}
              </Text>
            </div>
          ))}
        </div>
      </Panel>

      {/* Workflow Timeline */}
      <Panel headerText="Workflow Status" style={{ marginBottom: '1rem' }}>
        <WorkflowTimeline submission={submission} />
      </Panel>

      {/* Actions */}
      {canTakeAction && (
        <Panel headerText="Actions">
          <div style={{ padding: '1rem' }}>
            <Text style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
              Comments (optional):
            </Text>
            <TextArea
              value={comments}
              onInput={(e: any) => setComments(e.target.value)}
              rows={3}
              placeholder="Add your comments here..."
              style={{ width: '100%', marginBottom: '1rem' }}
            />

            <FlexBox justifyContent="End" style={{ gap: '0.5rem' }}>
              <Button
                design="Negative"
                onClick={() => {
                  if (onReject) {
                    onReject(comments);
                    setComments('');
                  }
                }}
              >
                Reject
              </Button>
              <Button
                design="Positive"
                onClick={() => {
                  if (onApprove) {
                    onApprove(comments);
                    setComments('');
                  }
                }}
              >
                Approve
              </Button>
            </FlexBox>
          </div>
        </Panel>
      )}
    </div>
  );
}
