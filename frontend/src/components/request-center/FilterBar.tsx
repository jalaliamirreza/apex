import { FlexBox, Select, Option, Input, Icon } from '@ui5/webcomponents-react';

interface FilterBarProps {
  statusFilter: string;
  searchQuery: string;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
  activeTab: 'inbox' | 'my-requests' | 'history';
}

export function FilterBar({
  statusFilter,
  searchQuery,
  onStatusChange,
  onSearchChange,
  activeTab
}: FilterBarProps) {
  return (
    <FlexBox
      alignItems="Center"
      style={{
        padding: '1rem',
        gap: '1rem',
        borderBottom: '1px solid #e5e5e5',
        background: '#fafafa'
      }}
    >
      {/* Status Filter - Only show for My Requests and History */}
      {activeTab !== 'inbox' && (
        <Select
          value={statusFilter}
          onChange={(e: any) => onStatusChange(e.detail.selectedOption.value)}
          style={{ minWidth: '150px' }}
        >
          <Option value="all">All Status</Option>
          {activeTab === 'my-requests' && (
            <>
              <Option value="pending">Pending</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </>
          )}
          {activeTab === 'history' && (
            <>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </>
          )}
        </Select>
      )}

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
        <Input
          value={searchQuery}
          onInput={(e: any) => onSearchChange(e.target.value)}
          placeholder="Search by form name or submitter..."
          style={{ width: '100%', paddingLeft: '2.5rem' }}
        />
        <Icon
          name="search"
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6a6d70',
            fontSize: '1rem',
            pointerEvents: 'none'
          }}
        />
      </div>
    </FlexBox>
  );
}
