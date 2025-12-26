# Phase 19B: Request Center App

## Overview

Single application for managing workflow requests. Replaces multiple tiles with one unified interface using tabs.

**Location:** `/app/request-center`

---

## Design

### Layout: Master-Detail with Tabs

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back    Request Center  /  مرکز درخواست‌ها                            │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────────┐ ┌──────────────┐                 │
│  │ Inbox (3)    │ │ My Requests (12) │ │ History      │                 │
│  │ کارتابل      │ │ درخواست‌های من    │ │ تاریخچه      │                 │
│  └──────────────┴─┴──────────────────┴─┴──────────────┘                 │
├─────────────────────────────────────────────────────────────────────────┤
│  [Status ▼] [Form Type ▼] [Date Range] [🔍 Search...]                   │
├────────────────────────────────────┬────────────────────────────────────┤
│                                    │                                    │
│  REQUEST LIST                      │  DETAIL PANEL                      │
│  ─────────────────────────────     │  ─────────────────────────────     │
│                                    │                                    │
│  ▸ Emp Loan - HR Employee          │  Emp Loan Request                  │
│    Pending • 2 hours ago           │  فرم وام کارکنان                    │
│                                    │  ─────────────────────────────     │
│    Vacation - Finance Employee     │                                    │
│    Pending • 1 day ago             │  Submitted by: hr-employee         │
│                                    │  Date: 2025-12-26 10:30            │
│    IT Request - IT Employee        │  Status: Pending Approval          │
│    Pending • 2 days ago            │                                    │
│                                    │  ─────────────────────────────     │
│                                    │  Form Data:                        │
│                                    │  • Full Name: Test User            │
│                                    │  • Loan Type: Marriage             │
│                                    │  • Amount: 50,000,000              │
│                                    │                                    │
│                                    │  ─────────────────────────────     │
│                                    │  Workflow Status:                  │
│                                    │  ● Manager Review (current)        │
│                                    │    Assigned to: hr-manager         │
│                                    │                                    │
│                                    │  ─────────────────────────────     │
│                                    │  [Approve]  [Reject]               │
│                                    │                                    │
│                                    │  Comment: ___________________      │
│                                    │                                    │
└────────────────────────────────────┴────────────────────────────────────┘
```

---

## Tabs

### Tab 1: Inbox (کارتابل)
- Tasks assigned to current user for approval
- API: `GET /api/v1/workflow/my-tasks`
- Shows: form name, submitter, date, status
- Actions: Approve, Reject

### Tab 2: My Requests (درخواست‌های من)
- Submissions created by current user
- API: `GET /api/v1/workflow/my-submissions`
- Shows: form name, date, workflow status
- Actions: View only (no approve/reject)

### Tab 3: History (تاریخچه)
- Completed tasks (approved/rejected by current user)
- API: `GET /api/v1/workflow/my-history` (new endpoint needed)
- Shows: form name, submitter, decision, date
- Actions: View only

---

## API Endpoints

### Existing (from Phase 18/19A)
```
GET  /api/v1/workflow/my-tasks          - Inbox items
GET  /api/v1/workflow/my-submissions    - Outbox items
GET  /api/v1/workflow/submissions/:id   - Submission detail
POST /api/v1/workflow/submissions/:id/steps/:step/complete - Approve/Reject
```

### New Endpoint Needed
```
GET /api/v1/workflow/my-history
```
Returns tasks where `acted_by = current_user` (completed approvals).

---

## Components

### 1. RequestCenterPage.tsx
**Location:** `frontend/src/pages/RequestCenterPage.tsx`

Main page component:
- Tab bar (Inbox / My Requests / History)
- Filter bar
- Master-detail layout
- Responsive: stack on mobile

### 2. RequestList.tsx
**Location:** `frontend/src/components/request-center/RequestList.tsx`

List component:
- Virtualized for performance (if many items)
- Click to select
- Visual indicator for selected item
- Status badge (pending/approved/rejected)

### 3. RequestDetail.tsx
**Location:** `frontend/src/components/request-center/RequestDetail.tsx`

Detail panel:
- Form metadata (name, submitter, date)
- Form data display (key-value pairs)
- Workflow timeline (current step highlighted)
- Action buttons (Approve/Reject) - only in Inbox tab
- Comment input

### 4. ApprovalDialog.tsx
**Location:** `frontend/src/components/request-center/ApprovalDialog.tsx`

Confirmation dialog:
- Action confirmation (Approve/Reject)
- Required comment for Reject
- Optional comment for Approve
- Loading state during submission

---

## UI5 Components

```tsx
import {
  Page,
  Bar,
  Title,
  Button,
  TabContainer,
  Tab,
  FlexBox,
  List,
  StandardListItem,
  ObjectStatus,
  Panel,
  Form,
  FormItem,
  Label,
  Text,
  TextArea,
  Dialog,
  MessageStrip,
  BusyIndicator,
  Icon,
  Badge,
  Timeline,
  TimelineItem,
  FilterBar,
  FilterGroupItem,
  Select,
  Option,
  DateRangePicker,
  Input
} from '@ui5/webcomponents-react';
```

---

## State Management

```typescript
interface RequestCenterState {
  activeTab: 'inbox' | 'my-requests' | 'history';
  
  // Data
  inboxItems: Task[];
  mySubmissions: Submission[];
  historyItems: CompletedTask[];
  
  // Selection
  selectedItemId: string | null;
  selectedItemDetail: SubmissionDetail | null;
  
  // Filters
  statusFilter: string | null;
  formTypeFilter: string | null;
  dateRange: { start: Date; end: Date } | null;
  searchQuery: string;
  
  // UI
  isLoading: boolean;
  isDetailLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  
  // Dialog
  approvalDialogOpen: boolean;
  approvalAction: 'approve' | 'reject' | null;
}
```

---

## Data Types

```typescript
interface Task {
  submission_id: string;
  step_id: string;
  form_name: string;
  form_name_fa: string;
  form_slug: string;
  step_name: string;
  assigned_to: string;
  submitted_by: string;
  submitted_at: string;
  data: Record<string, any>;
}

interface Submission {
  id: string;
  form_id: string;
  form_name: string;
  form_name_fa: string;
  form_slug: string;
  data: Record<string, any>;
  submitted_by: string;
  submitted_at: string;
  workflow_status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  current_step: string | null;
  assigned_to: string | null;
  step_status: string | null;
  acted_by: string | null;
  acted_at: string | null;
  step_comments: string | null;
}

interface CompletedTask {
  submission_id: string;
  form_name: string;
  form_name_fa: string;
  submitted_by: string;
  submitted_at: string;
  step_name: string;
  status: 'approved' | 'rejected';
  acted_at: string;
  comments: string | null;
}
```

---

## Workflow Timeline Component

Visual timeline showing workflow progress:

```
┌─────────────────────────────────────┐
│ Workflow Progress                   │
├─────────────────────────────────────┤
│                                     │
│  ● Submitted                        │
│  │ by hr-employee                   │
│  │ Dec 26, 2025 10:30              │
│  │                                  │
│  ◉ Manager Review  ← current        │
│  │ Assigned to: hr-manager          │
│  │ Pending                          │
│  │                                  │
│  ○ HR Approval                      │
│  │ Not started                      │
│  │                                  │
│  ○ Complete                         │
│                                     │
└─────────────────────────────────────┘
```

**Note:** For Phase 19B, we only have single-step workflow. Timeline shows:
- Submitted (always completed)
- Current step (manager_review)
- End state (approved/rejected)

---

## Status Badges

| Status | English | Persian | Color |
|--------|---------|---------|-------|
| pending | Pending | در انتظار | Orange |
| in_progress | In Progress | در حال بررسی | Blue |
| approved | Approved | تایید شده | Green |
| rejected | Rejected | رد شده | Red |

---

## Access Control

| User Role | Inbox | My Requests | History | Can Approve |
|-----------|-------|-------------|---------|-------------|
| employee | Empty | Own | Empty | No |
| manager | Assigned tasks | Own | Own decisions | Yes |
| director | All tasks | Own | Own decisions | Yes |
| admin | Empty (no workflow role) | Empty | Empty | No |

---

## Responsive Design

### Desktop (>1024px)
- Master-detail side by side (60% / 40%)
- Filter bar horizontal

### Tablet (768px - 1024px)
- Master-detail side by side (50% / 50%)
- Filter bar horizontal

### Mobile (<768px)
- List only view
- Click item → navigate to detail page
- Or: use Dialog for detail

---

## Error States

1. **No tasks:** "No pending tasks / هیچ درخواستی برای تایید وجود ندارد"
2. **No submissions:** "No requests submitted / هیچ درخواستی ثبت نشده است"
3. **Load error:** "Failed to load requests / خطا در بارگذاری درخواست‌ها"
4. **Approve error:** "Failed to process request / خطا در پردازش درخواست"

---

## Files to Create

| File | Description |
|------|-------------|
| `frontend/src/pages/RequestCenterPage.tsx` | Main page |
| `frontend/src/components/request-center/RequestList.tsx` | List component |
| `frontend/src/components/request-center/RequestDetail.tsx` | Detail panel |
| `frontend/src/components/request-center/ApprovalDialog.tsx` | Confirm dialog |
| `frontend/src/components/request-center/WorkflowTimeline.tsx` | Timeline component |
| `frontend/src/components/request-center/FilterBar.tsx` | Filter controls |
| `frontend/src/services/workflowApi.ts` | API client |
| `frontend/src/types/workflow.ts` | TypeScript types |
| `backend/src/routes/workflow.routes.ts` | Add /my-history endpoint |

---

## Files to Modify

| File | Change |
|------|--------|
| `frontend/src/App.tsx` | Add route `/app/request-center` |
| `backend/migrations/` | Add tile for Request Center |

---

## Database: Add Tile

```sql
-- Add Request Center tile to My Requests space
INSERT INTO tiles (id, section_id, name, name_fa, slug, description, icon, color, type, order_index, direction, config, is_active)
SELECT 
  gen_random_uuid(),
  s.id,
  'Request Center',
  'مرکز درخواست‌ها',
  'request-center',
  'View and manage your requests and approvals',
  'task',
  '#0a6ed1',
  'app',
  1,
  'rtl',
  '{"route": "/app/request-center"}'::jsonb,
  true
FROM sections s
JOIN pages p ON s.page_id = p.id
JOIN spaces sp ON p.space_id = sp.id
WHERE sp.slug = 'my-requests' AND p.slug = 'all'
LIMIT 1;
```

---

## Testing Checklist

### Inbox Tab
- [ ] Manager sees tasks assigned to them
- [ ] Director sees all pending tasks
- [ ] Employee sees empty inbox
- [ ] Click task shows detail
- [ ] Approve button works
- [ ] Reject button works
- [ ] Comment saved on approval

### My Requests Tab
- [ ] User sees own submissions
- [ ] Status shows correctly (pending/approved/rejected)
- [ ] No approve/reject buttons
- [ ] Detail shows form data

### History Tab
- [ ] Shows completed approvals by current user
- [ ] Shows decision (approved/rejected)
- [ ] Shows comments

### Filters
- [ ] Status filter works
- [ ] Form type filter works
- [ ] Date range filter works
- [ ] Search works

### Responsive
- [ ] Desktop layout correct
- [ ] Mobile layout correct

---

## Claude Code Prompt

```
Read PHASE19B-REQUEST-CENTER.md and implement in order:

1. Create frontend/src/types/workflow.ts - TypeScript types for Task, Submission, CompletedTask
2. Create frontend/src/services/workflowApi.ts - API client for workflow endpoints
3. Add GET /api/v1/workflow/my-history endpoint in backend/src/routes/workflow.routes.ts
4. Create frontend/src/components/request-center/RequestList.tsx - list with selection
5. Create frontend/src/components/request-center/WorkflowTimeline.tsx - visual timeline
6. Create frontend/src/components/request-center/RequestDetail.tsx - detail panel with form data
7. Create frontend/src/components/request-center/ApprovalDialog.tsx - approve/reject confirmation
8. Create frontend/src/components/request-center/FilterBar.tsx - status, form type, date filters
9. Create frontend/src/pages/RequestCenterPage.tsx - main page with tabs and master-detail layout
10. Update frontend/src/App.tsx - add route /app/request-center
11. Create migration to add Request Center tile to My Requests space
12. Run migration and rebuild containers
13. Test as hr-manager: should see inbox with pending task, approve it, verify in history

After implementation, create PHASE19B-IMPLEMENTATION-DOCS.md documenting all files and test results.
```
