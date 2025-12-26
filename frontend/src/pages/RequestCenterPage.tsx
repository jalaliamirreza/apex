import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlexBox,
  Title,
  Button,
  TabContainer,
  Tab,
  Badge,
  Icon,
  MessageStrip,
  BusyIndicator
} from '@ui5/webcomponents-react';
import { workflowApi } from '../services/workflowApi';
import { Task, Submission, CompletedTask, SubmissionDetail } from '../types/workflow';
import { RequestList } from '../components/request-center/RequestList';
import { RequestDetail } from '../components/request-center/RequestDetail';
import { ApprovalDialog } from '../components/request-center/ApprovalDialog';
import { FilterBar } from '../components/request-center/FilterBar';

type TabType = 'inbox' | 'my-requests' | 'history';

export default function RequestCenterPage() {
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('inbox');

  // Data state
  const [inboxItems, setInboxItems] = useState<Task[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [historyItems, setHistoryItems] = useState<CompletedTask[]>([]);

  // Selection state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SubmissionDetail | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);

  // Load data on mount and tab change
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Load detail when selection changes
  useEffect(() => {
    if (selectedItemId) {
      loadDetail(selectedItemId);
    } else {
      setSelectedDetail(null);
    }
  }, [selectedItemId]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (activeTab === 'inbox') {
        const { tasks } = await workflowApi.getMyTasks();
        setInboxItems(tasks);
      } else if (activeTab === 'my-requests') {
        const { submissions } = await workflowApi.getMySubmissions();
        setMySubmissions(submissions);
      } else if (activeTab === 'history') {
        const { tasks } = await workflowApi.getMyHistory();
        setHistoryItems(tasks);
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError('Failed to load requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    setIsDetailLoading(true);
    setError(null);

    try {
      const { submission } = await workflowApi.getSubmissionDetail(id);
      setSelectedDetail(submission);
    } catch (err: any) {
      console.error('Failed to load detail:', err);
      setError('Failed to load request details.');
      setSelectedDetail(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleApprove = (comments: string) => {
    setApprovalAction('approve');
    setApprovalDialogOpen(true);
  };

  const handleReject = (comments: string) => {
    setApprovalAction('reject');
    setApprovalDialogOpen(true);
  };

  const handleConfirmAction = async (comments: string) => {
    if (!selectedDetail || !approvalAction) return;

    setIsActionLoading(true);
    setError(null);

    try {
      const currentStep = selectedDetail.current_step || 'manager_review';
      await workflowApi.completeStep(
        selectedDetail.id,
        currentStep,
        approvalAction,
        comments
      );

      // Close dialog
      setApprovalDialogOpen(false);
      setApprovalAction(null);

      // Reload data and detail
      await loadData();
      await loadDetail(selectedDetail.id);

      // Clear selection if in inbox (task is now completed)
      if (activeTab === 'inbox') {
        setSelectedItemId(null);
      }
    } catch (err: any) {
      console.error('Failed to complete action:', err);
      setError('Failed to process request. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelAction = () => {
    setApprovalDialogOpen(false);
    setApprovalAction(null);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedItemId(null);
    setStatusFilter('all');
    setSearchQuery('');
  };

  // Filter items based on filters
  const getFilteredItems = () => {
    let items: any[] = [];

    if (activeTab === 'inbox') {
      items = inboxItems;
    } else if (activeTab === 'my-requests') {
      items = mySubmissions;
    } else if (activeTab === 'history') {
      items = historyItems;
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (activeTab === 'my-requests') {
        items = items.filter((item: Submission) => item.workflow_status === statusFilter);
      } else if (activeTab === 'history') {
        items = items.filter((item: CompletedTask) => item.status === statusFilter);
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item: any) => {
        const formName = (item.form_name || '').toLowerCase();
        const formNameFa = (item.form_name_fa || '').toLowerCase();
        const submitter = (item.submitted_by || '').toLowerCase();
        return formName.includes(query) || formNameFa.includes(query) || submitter.includes(query);
      });
    }

    return items;
  };

  const filteredItems = getFilteredItems();

  return (
    <FlexBox direction="Column" style={{ height: '100vh' }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #e5e5e5',
        background: 'white'
      }}>
        <FlexBox alignItems="Center" justifyContent="SpaceBetween">
          <FlexBox alignItems="Center" style={{ gap: '1rem' }}>
            <Button
              icon="nav-back"
              design="Transparent"
              onClick={() => navigate('/launchpad')}
            />
            <div>
              <Title level="H3">Request Center</Title>
              <div style={{ fontSize: '0.875rem', color: '#6a6d70' }}>
                مرکز درخواست‌ها
              </div>
            </div>
          </FlexBox>
        </FlexBox>
      </div>

      {/* Error Message */}
      {error && (
        <MessageStrip
          design="Negative"
          onClose={() => setError(null)}
          style={{ margin: '1rem' }}
        >
          {error}
        </MessageStrip>
      )}

      {/* Tabs */}
      <TabContainer
        onTabSelect={(e: any) => {
          const tabName = e.detail.tab.dataset.tabName as TabType;
          if (tabName) handleTabChange(tabName);
        }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Tab
          text={
            <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
              <span>Inbox</span>
              {inboxItems.length > 0 && <Badge colorScheme="8">{inboxItems.length}</Badge>}
            </FlexBox>
          }
          additionalText="کارتابل"
          data-tab-name="inbox"
        >
          {isLoading ? (
            <FlexBox
              alignItems="Center"
              justifyContent="Center"
              style={{ padding: '3rem' }}
            >
              <BusyIndicator active size="L" />
            </FlexBox>
          ) : (
            <>
              <FilterBar
                statusFilter={statusFilter}
                searchQuery={searchQuery}
                onStatusChange={setStatusFilter}
                onSearchChange={setSearchQuery}
                activeTab="inbox"
              />
              <FlexBox style={{ flex: 1, overflow: 'hidden' }}>
                {/* Master */}
                <div style={{
                  width: '40%',
                  borderRight: '1px solid #e5e5e5',
                  overflow: 'auto'
                }}>
                  <RequestList
                    items={filteredItems}
                    selectedId={selectedItemId}
                    onSelect={setSelectedItemId}
                    type="inbox"
                  />
                </div>
                {/* Detail */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <RequestDetail
                    submission={selectedDetail}
                    isLoading={isDetailLoading}
                    showActions={true}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                </div>
              </FlexBox>
            </>
          )}
        </Tab>

        <Tab
          text={
            <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
              <span>My Requests</span>
              {mySubmissions.length > 0 && <Badge colorScheme="8">{mySubmissions.length}</Badge>}
            </FlexBox>
          }
          additionalText="درخواست‌های من"
          data-tab-name="my-requests"
        >
          {isLoading ? (
            <FlexBox
              alignItems="Center"
              justifyContent="Center"
              style={{ padding: '3rem' }}
            >
              <BusyIndicator active size="L" />
            </FlexBox>
          ) : (
            <>
              <FilterBar
                statusFilter={statusFilter}
                searchQuery={searchQuery}
                onStatusChange={setStatusFilter}
                onSearchChange={setSearchQuery}
                activeTab="my-requests"
              />
              <FlexBox style={{ flex: 1, overflow: 'hidden' }}>
                {/* Master */}
                <div style={{
                  width: '40%',
                  borderRight: '1px solid #e5e5e5',
                  overflow: 'auto'
                }}>
                  <RequestList
                    items={filteredItems}
                    selectedId={selectedItemId}
                    onSelect={setSelectedItemId}
                    type="my-requests"
                  />
                </div>
                {/* Detail */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <RequestDetail
                    submission={selectedDetail}
                    isLoading={isDetailLoading}
                    showActions={false}
                  />
                </div>
              </FlexBox>
            </>
          )}
        </Tab>

        <Tab
          text="History"
          additionalText="تاریخچه"
          data-tab-name="history"
        >
          {isLoading ? (
            <FlexBox
              alignItems="Center"
              justifyContent="Center"
              style={{ padding: '3rem' }}
            >
              <BusyIndicator active size="L" />
            </FlexBox>
          ) : (
            <>
              <FilterBar
                statusFilter={statusFilter}
                searchQuery={searchQuery}
                onStatusChange={setStatusFilter}
                onSearchChange={setSearchQuery}
                activeTab="history"
              />
              <FlexBox style={{ flex: 1, overflow: 'hidden' }}>
                {/* Master */}
                <div style={{
                  width: '40%',
                  borderRight: '1px solid #e5e5e5',
                  overflow: 'auto'
                }}>
                  <RequestList
                    items={filteredItems}
                    selectedId={selectedItemId}
                    onSelect={setSelectedItemId}
                    type="history"
                  />
                </div>
                {/* Detail */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <RequestDetail
                    submission={selectedDetail}
                    isLoading={isDetailLoading}
                    showActions={false}
                  />
                </div>
              </FlexBox>
            </>
          )}
        </Tab>
      </TabContainer>

      {/* Approval Dialog */}
      <ApprovalDialog
        isOpen={approvalDialogOpen}
        action={approvalAction}
        isLoading={isActionLoading}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </FlexBox>
  );
}
