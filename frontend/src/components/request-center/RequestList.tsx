import { List, ListItemStandard, ObjectStatus, Icon, FlexBox, Text } from '@ui5/webcomponents-react';
import { Task, Submission, CompletedTask } from '../../types/workflow';

interface RequestListProps {
  items: Task[] | Submission[] | CompletedTask[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  type: 'inbox' | 'my-requests' | 'history';
}

export function RequestList({ items, selectedId, onSelect, type }: RequestListProps) {
  if (items.length === 0) {
    return (
      <FlexBox
        direction="Column"
        alignItems="Center"
        justifyContent="Center"
        style={{ padding: '3rem', textAlign: 'center' }}
      >
        <Icon
          name="inbox"
          style={{
            fontSize: '4rem',
            color: '#6a6d70',
            marginBottom: '1rem'
          }}
        />
        <Text style={{ fontSize: '1.25rem', fontWeight: 600, color: '#32363a', marginBottom: '0.5rem' }}>
          {type === 'inbox' && 'No pending tasks'}
          {type === 'my-requests' && 'No requests submitted'}
          {type === 'history' && 'No history'}
        </Text>
        <Text style={{ fontSize: '0.875rem', color: '#6a6d70' }}>
          {type === 'inbox' && 'هیچ درخواستی برای تایید وجود ندارد'}
          {type === 'my-requests' && 'هیچ درخواستی ثبت نشده است'}
          {type === 'history' && 'هیچ تاریخچه‌ای وجود ندارد'}
        </Text>
      </FlexBox>
    );
  }

  const getItemId = (item: Task | Submission | CompletedTask): string => {
    if ('id' in item) return item.id;
    return item.submission_id;
  };

  const getItemTitle = (item: Task | Submission | CompletedTask): string => {
    return item.form_name_fa || item.form_name;
  };

  const getItemDescription = (item: Task | Submission | CompletedTask): string => {
    const submitter = item.submitted_by.split('@')[0];
    const date = new Date(item.submitted_at).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (type === 'history' && 'acted_at' in item && item.acted_at) {
      const actedDate = new Date(item.acted_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${submitter} • ${actedDate}`;
    }

    return `${submitter} • ${date}`;
  };

  const getItemStatus = (item: Task | Submission | CompletedTask) => {
    if (type === 'inbox') {
      return <ObjectStatus state="Critical">Pending</ObjectStatus>;
    }

    if (type === 'my-requests' && 'workflow_status' in item) {
      const statusMap: Record<string, { text: string; state: any }> = {
        'pending': { text: 'Pending', state: 'Critical' },
        'in_progress': { text: 'In Progress', state: 'Information' },
        'approved': { text: 'Approved', state: 'Positive' },
        'rejected': { text: 'Rejected', state: 'Negative' }
      };
      const status = statusMap[item.workflow_status] || { text: item.workflow_status, state: 'None' };
      return <ObjectStatus state={status.state}>{status.text}</ObjectStatus>;
    }

    if (type === 'history' && 'status' in item) {
      const state = item.status === 'approved' ? 'Positive' : 'Negative';
      const text = item.status === 'approved' ? 'Approved' : 'Rejected';
      return <ObjectStatus state={state}>{text}</ObjectStatus>;
    }

    return null;
  };

  return (
    <List>
      {items.map((item) => {
        const itemId = getItemId(item);
        const isSelected = selectedId === itemId;

        return (
          <div
            key={itemId}
            onClick={() => onSelect(itemId)}
            style={{
              cursor: 'pointer',
              background: isSelected ? '#e5f1fa' : 'transparent',
              borderLeft: isSelected ? '4px solid #0070f2' : '4px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <ListItemStandard
              additionalText={getItemDescription(item)}
              additionalTextState="None"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Text style={{ fontWeight: isSelected ? 600 : 400 }}>
                  {getItemTitle(item)}
                </Text>
                {getItemStatus(item)}
              </div>
            </ListItemStandard>
          </div>
        );
      })}
    </List>
  );
}
