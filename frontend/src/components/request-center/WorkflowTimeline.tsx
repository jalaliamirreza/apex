import { Timeline, TimelineItem, Icon, Text } from '@ui5/webcomponents-react';
import { SubmissionDetail } from '../../types/workflow';

interface WorkflowTimelineProps {
  submission: SubmissionDetail;
}

export function WorkflowTimeline({ submission }: WorkflowTimelineProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'pending': '#e76500',
      'approved': '#0f828f',
      'rejected': '#b00'
    };
    return colorMap[status] || '#6a6d70';
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, string> = {
      'pending': 'pending',
      'approved': 'accept',
      'rejected': 'decline'
    };
    return iconMap[status] || 'circle-task-2';
  };

  return (
    <div style={{ padding: '1rem' }}>
      <Text style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'block' }}>
        Workflow Progress
      </Text>

      <Timeline>
        {/* Submitted Step - Always Complete */}
        <TimelineItem
          icon="document"
          titleText="Submitted"
          subtitleText={`by ${submission.submitted_by.split('@')[0]}`}
        >
          <Text style={{ fontSize: '0.75rem', color: '#6a6d70' }}>
            {formatDate(submission.submitted_at)}
          </Text>
        </TimelineItem>

        {/* Approval Steps */}
        {submission.approval_steps.map((step, index) => {
          const isCurrent = step.status === 'pending';
          const isCompleted = step.status === 'approved' || step.status === 'rejected';

          return (
            <TimelineItem
              key={index}
              icon={getStatusIcon(step.status)}
              titleText={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Text style={{ fontWeight: isCurrent ? 600 : 400 }}>
                    {step.step_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  {isCurrent && (
                    <Icon
                      name="arrow-right"
                      style={{ color: '#0070f2', fontSize: '0.875rem' }}
                    />
                  )}
                </div>
              }
              subtitleText={
                step.assigned_to
                  ? `Assigned to: ${step.assigned_to.split('@')[0]}`
                  : 'Unassigned'
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Text
                  style={{
                    fontSize: '0.75rem',
                    color: getStatusColor(step.status),
                    fontWeight: 500
                  }}
                >
                  {step.status === 'pending' && 'Pending'}
                  {step.status === 'approved' && 'Approved'}
                  {step.status === 'rejected' && 'Rejected'}
                </Text>

                {isCompleted && step.acted_by && (
                  <Text style={{ fontSize: '0.75rem', color: '#6a6d70' }}>
                    by {step.acted_by.split('@')[0]} • {formatDate(step.acted_at!)}
                  </Text>
                )}

                {step.comments && (
                  <Text
                    style={{
                      fontSize: '0.75rem',
                      color: '#32363a',
                      fontStyle: 'italic',
                      marginTop: '0.25rem'
                    }}
                  >
                    "{step.comments}"
                  </Text>
                )}
              </div>
            </TimelineItem>
          );
        })}

        {/* Final Status */}
        {submission.workflow_status === 'approved' && (
          <TimelineItem
            icon="complete"
            titleText="Completed"
            subtitleText="Request approved"
          >
            <Text style={{ fontSize: '0.75rem', color: '#0f828f' }}>
              {submission.completed_at && formatDate(submission.completed_at)}
            </Text>
          </TimelineItem>
        )}

        {submission.workflow_status === 'rejected' && (
          <TimelineItem
            icon="decline"
            titleText="Rejected"
            subtitleText="Request rejected"
          >
            <Text style={{ fontSize: '0.75rem', color: '#b00' }}>
              {submission.completed_at && formatDate(submission.completed_at)}
            </Text>
          </TimelineItem>
        )}
      </Timeline>
    </div>
  );
}
