# FUTURE SPEC: Multi-Level Approval with Step-Based Field Permissions

> **Status:** PLANNED (Not for immediate implementation)
> **Target Phase:** Phase 20+
> **Created:** 2025-12-25
> **Author:** PM/Architect

---

## Executive Summary

This specification documents the architecture for multi-level approval workflows where:
1. Forms pass through multiple approval steps (Clerk → Manager → HR → Director)
2. Different fields have different permissions at each step (editable, readonly, hidden)
3. Each approver can fill additional fields specific to their step
4. Full audit trail tracks who changed what at each step
5. PostgreSQL remains the single source of truth

---

## Business Requirements

### Use Case Example: Loan Application

| Step | Actor | What They Do |
|------|-------|--------------|
| 1. Entry | Clerk | Fills customer info, requested loan amount |
| 2. Review | Manager | Views request, fills accepted amount, adds comments |
| 3. Verify | HR | Verifies employment, fills verification notes |
| 4. Approve | Director | Final decision, fills final comments |

### Field Behavior Per Step

| Field | Clerk | Manager | HR | Director |
|-------|-------|---------|-----|----------|
| customer_name | ✏️ Editable | 👁️ Readonly | 👁️ Readonly | 👁️ Readonly |
| customer_id | ✏️ Editable | 👁️ Readonly | 👁️ Readonly | 👁️ Readonly |
| requested_amount | ✏️ Editable | 👁️ Readonly | 👁️ Readonly | 👁️ Readonly |
| loan_purpose | ✏️ Editable | 👁️ Readonly | 👁️ Readonly | 👁️ Readonly |
| accepted_amount | 🚫 Hidden | ✏️ Editable | 👁️ Readonly | 👁️ Readonly |
| manager_comments | 🚫 Hidden | ✏️ Editable | 👁️ Readonly | 👁️ Readonly |
| employment_verified | 🚫 Hidden | 🚫 Hidden | ✏️ Editable | 👁️ Readonly |
| hr_notes | 🚫 Hidden | 🚫 Hidden | ✏️ Editable | 👁️ Readonly |
| final_decision | 🚫 Hidden | 🚫 Hidden | 🚫 Hidden | ✏️ Editable |
| director_comments | 🚫 Hidden | 🚫 Hidden | 🚫 Hidden | ✏️ Editable |

**Legend:**
- ✏️ Editable: User can input/change value
- 👁️ Readonly: User can see but not change
- 🚫 Hidden: Field not visible to user
- ⚠️ Required: Must fill before submit (variant of Editable)

---

## Architecture Overview

### Single Source of Truth: PostgreSQL

```
┌──────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL (SSOT)                            │
│                                                                      │
│  ┌─────────────┐    ┌───────────────────────┐    ┌────────────────┐ │
│  │   forms     │───▶│ form_step_permissions │    │  submissions   │ │
│  │             │    │                       │    │                │ │
│  │ - schema    │    │ - form_id             │    │ - data (JSON)  │ │
│  │ - steps     │    │ - step_name           │    │ - status       │ │
│  └─────────────┘    │ - field_name          │    └────────────────┘ │
│                     │ - permission          │           │          │
│                     └───────────────────────┘           │          │
│                                                         │          │
│                     ┌───────────────────────┐           │          │
│                     │   approval_steps      │◄──────────┘          │
│                     │                       │                      │
│                     │ - submission_id       │                      │
│                     │ - step_name           │                      │
│                     │ - field_changes       │                      │
│                     │ - acted_by            │                      │
│                     └───────────────────────┘                      │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ orchestration only
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         Zeebe (Orchestrator)                         │
│                                                                      │
│   Role: Traffic controller only                                      │
│   Stores: { submissionId } - reference only                          │
│   Does NOT store: form data, decisions, approval history             │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Zeebe's Limited Role

| Zeebe Responsibility | NOT Zeebe's Responsibility |
|---------------------|---------------------------|
| Track which step is current | Store form data |
| Route to next step | Store approval decisions |
| Create user tasks | Store approval history |
| Handle timeouts/escalations | Be queried for reports |
| Parallel approvals (if needed) | Store field changes |

---

## Database Schema

### Table: forms (existing + modifications)

```sql
-- Existing table, add workflow configuration
ALTER TABLE forms ADD COLUMN IF NOT EXISTS
  workflow_config JSONB DEFAULT '{}'::jsonb;

-- workflow_config example:
-- {
--   "enabled": true,
--   "process_id": "loan-approval-process",
--   "steps": ["clerk_entry", "manager_review", "hr_verify", "director_approval"]
-- }
```

### Table: form_step_permissions (NEW)

```sql
CREATE TABLE form_step_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL,
  field_name VARCHAR(255) NOT NULL,
  permission VARCHAR(20) NOT NULL CHECK (permission IN ('editable', 'readonly', 'hidden', 'required')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(form_id, step_name, field_name)
);

-- Indexes
CREATE INDEX idx_fsp_form_step ON form_step_permissions(form_id, step_name);
CREATE INDEX idx_fsp_form_id ON form_step_permissions(form_id);

-- Comments
COMMENT ON TABLE form_step_permissions IS 'Defines field-level permissions for each workflow step';
COMMENT ON COLUMN form_step_permissions.permission IS 'editable=can edit, readonly=visible but disabled, hidden=not shown, required=must fill';
```

### Table: approval_steps (NEW)

```sql
CREATE TABLE approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL,
  step_order INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped', 'canceled')),
  
  -- Assignment
  assigned_to VARCHAR(255),          -- Role or group (e.g., 'managers', 'hr_team')
  assigned_user VARCHAR(255),        -- Specific user if assigned individually
  
  -- Action tracking
  acted_by VARCHAR(255),             -- Who actually completed the step
  acted_at TIMESTAMP,
  comments TEXT,
  
  -- Field changes audit
  field_changes JSONB DEFAULT '{}'::jsonb,
  -- Example: {"accepted_amount": {"old": null, "new": 45000}, "manager_comments": {"old": null, "new": "Approved"}}
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  due_date TIMESTAMP,                -- For escalation
  reminder_sent BOOLEAN DEFAULT false,
  
  UNIQUE(submission_id, step_name)
);

-- Indexes
CREATE INDEX idx_as_submission ON approval_steps(submission_id);
CREATE INDEX idx_as_pending ON approval_steps(status, step_name) WHERE status = 'pending';
CREATE INDEX idx_as_assigned ON approval_steps(assigned_to, status) WHERE status = 'pending';
CREATE INDEX idx_as_user ON approval_steps(assigned_user, status) WHERE status = 'pending';

-- Comments
COMMENT ON TABLE approval_steps IS 'Tracks each approval step for a submission';
COMMENT ON COLUMN approval_steps.field_changes IS 'JSON audit of what fields were changed in this step';
```

### Table: submissions (existing + modifications)

```sql
-- Add workflow tracking columns
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS
  workflow_status VARCHAR(50) DEFAULT 'draft' 
    CHECK (workflow_status IN ('draft', 'pending', 'in_progress', 'approved', 'rejected', 'canceled')),
  current_step VARCHAR(100),
  process_instance_key BIGINT,
  completed_at TIMESTAMP;

-- Indexes
CREATE INDEX idx_sub_workflow_status ON submissions(workflow_status);
CREATE INDEX idx_sub_current_step ON submissions(current_step) WHERE current_step IS NOT NULL;
CREATE INDEX idx_sub_process_key ON submissions(process_instance_key) WHERE process_instance_key IS NOT NULL;
```

---

## Data Flow Examples

### Example 1: Loan Application Journey

#### Step 1: Clerk Entry

```sql
-- Clerk submits form
INSERT INTO submissions (id, form_id, data, workflow_status, current_step)
VALUES (
  'sub-001',
  'loan-form-id',
  '{
    "customer_name": "Ali Ahmadi",
    "customer_id": "1234567890",
    "requested_amount": 50000000,
    "loan_purpose": "Home renovation"
  }',
  'in_progress',
  'manager_review'
);

-- Create approval steps
INSERT INTO approval_steps (submission_id, step_name, step_order, status, assigned_to) VALUES
  ('sub-001', 'clerk_entry', 1, 'approved', 'clerks'),      -- Auto-approved (entry step)
  ('sub-001', 'manager_review', 2, 'pending', 'managers'),
  ('sub-001', 'hr_verify', 3, 'pending', 'hr_team'),
  ('sub-001', 'director_approval', 4, 'pending', 'directors');

-- Record clerk's entry
UPDATE approval_steps SET
  status = 'approved',
  acted_by = 'clerk@company.com',
  acted_at = NOW(),
  field_changes = '{
    "customer_name": {"old": null, "new": "Ali Ahmadi"},
    "customer_id": {"old": null, "new": "1234567890"},
    "requested_amount": {"old": null, "new": 50000000},
    "loan_purpose": {"old": null, "new": "Home renovation"}
  }'
WHERE submission_id = 'sub-001' AND step_name = 'clerk_entry';
```

#### Step 2: Manager Review

```sql
-- Manager approves and fills accepted amount
UPDATE submissions SET
  data = data || '{"accepted_amount": 45000000, "manager_comments": "Good customer history, reducing amount slightly"}',
  current_step = 'hr_verify'
WHERE id = 'sub-001';

-- Record manager's action
UPDATE approval_steps SET
  status = 'approved',
  acted_by = 'manager@company.com',
  acted_at = NOW(),
  comments = 'Approved with reduced amount',
  field_changes = '{
    "accepted_amount": {"old": null, "new": 45000000},
    "manager_comments": {"old": null, "new": "Good customer history, reducing amount slightly"}
  }'
WHERE submission_id = 'sub-001' AND step_name = 'manager_review';
```

#### Step 3: HR Verify

```sql
-- HR verifies employment
UPDATE submissions SET
  data = data || '{"employment_verified": true, "hr_notes": "Verified with employer, 5 years tenure"}',
  current_step = 'director_approval'
WHERE id = 'sub-001';

-- Record HR's action
UPDATE approval_steps SET
  status = 'approved',
  acted_by = 'hr@company.com',
  acted_at = NOW(),
  field_changes = '{
    "employment_verified": {"old": null, "new": true},
    "hr_notes": {"old": null, "new": "Verified with employer, 5 years tenure"}
  }'
WHERE submission_id = 'sub-001' AND step_name = 'hr_verify';
```

#### Step 4: Director Approval

```sql
-- Director gives final approval
UPDATE submissions SET
  data = data || '{"final_decision": "approved", "director_comments": "Approved for disbursement"}',
  workflow_status = 'approved',
  current_step = NULL,
  completed_at = NOW()
WHERE id = 'sub-001';

-- Record director's action
UPDATE approval_steps SET
  status = 'approved',
  acted_by = 'director@company.com',
  acted_at = NOW(),
  comments = 'Final approval granted',
  field_changes = '{
    "final_decision": {"old": null, "new": "approved"},
    "director_comments": {"old": null, "new": "Approved for disbursement"}
  }'
WHERE submission_id = 'sub-001' AND step_name = 'director_approval';
```

#### Final State

```sql
-- submissions.data contains ALL fields from all steps:
{
  "customer_name": "Ali Ahmadi",
  "customer_id": "1234567890",
  "requested_amount": 50000000,
  "loan_purpose": "Home renovation",
  "accepted_amount": 45000000,
  "manager_comments": "Good customer history, reducing amount slightly",
  "employment_verified": true,
  "hr_notes": "Verified with employer, 5 years tenure",
  "final_decision": "approved",
  "director_comments": "Approved for disbursement"
}

-- approval_steps contains WHO did WHAT at EACH step (audit trail)
```

---

## API Design

### Get Submission with Permissions for Current Step

```
GET /api/v1/submissions/:id?step=manager_review
```

**Response:**

```json
{
  "submission": {
    "id": "sub-001",
    "form_id": "loan-form-id",
    "data": {
      "customer_name": "Ali Ahmadi",
      "customer_id": "1234567890",
      "requested_amount": 50000000,
      "loan_purpose": "Home renovation"
    },
    "workflow_status": "in_progress",
    "current_step": "manager_review"
  },
  "field_permissions": {
    "customer_name": "readonly",
    "customer_id": "readonly",
    "requested_amount": "readonly",
    "loan_purpose": "readonly",
    "accepted_amount": "editable",
    "manager_comments": "editable",
    "employment_verified": "hidden",
    "hr_notes": "hidden",
    "final_decision": "hidden",
    "director_comments": "hidden"
  },
  "step_info": {
    "step_name": "manager_review",
    "step_order": 2,
    "assigned_to": "managers",
    "due_date": "2025-12-30T00:00:00Z"
  },
  "approval_history": [
    {
      "step_name": "clerk_entry",
      "status": "approved",
      "acted_by": "clerk@company.com",
      "acted_at": "2025-12-25T10:00:00Z"
    }
  ]
}
```

### Submit Step Approval/Rejection

```
POST /api/v1/submissions/:id/steps/:stepName/complete
```

**Request:**

```json
{
  "action": "approve",
  "field_updates": {
    "accepted_amount": 45000000,
    "manager_comments": "Good customer history"
  },
  "comments": "Approved with reduced amount"
}
```

**Backend Logic:**

1. Validate user has permission for this step
2. Validate only editable fields are being updated
3. Calculate field_changes (diff)
4. Update submissions.data with new fields
5. Update approval_steps record
6. Determine next step
7. Update submissions.current_step
8. Notify Zeebe to advance (if using)
9. Return success

### Get My Pending Tasks

```
GET /api/v1/workflow/my-tasks?user=manager@company.com
```

**Response:**

```json
{
  "tasks": [
    {
      "submission_id": "sub-001",
      "form_name": "Loan Application",
      "form_name_fa": "درخواست وام",
      "step_name": "manager_review",
      "submitted_by": "clerk@company.com",
      "submitted_at": "2025-12-25T10:00:00Z",
      "due_date": "2025-12-30T00:00:00Z",
      "preview": {
        "customer_name": "Ali Ahmadi",
        "requested_amount": 50000000
      }
    }
  ],
  "total": 1
}
```

### Get All Pending Tasks (Admin/Role-based)

```
GET /api/v1/workflow/tasks?step=manager_review&status=pending
```

### Configure Step Permissions (Admin)

```
PUT /api/v1/admin/forms/:formId/step-permissions
```

**Request:**

```json
{
  "step_name": "manager_review",
  "permissions": [
    {"field_name": "customer_name", "permission": "readonly"},
    {"field_name": "requested_amount", "permission": "readonly"},
    {"field_name": "accepted_amount", "permission": "editable"},
    {"field_name": "manager_comments", "permission": "editable"}
  ]
}
```

---

## Frontend Integration

### SurveyJS Permission Application

```typescript
// services/formPermissions.ts

interface FieldPermissions {
  [fieldName: string]: 'editable' | 'readonly' | 'hidden' | 'required';
}

export function applyPermissionsToSurvey(
  survey: SurveyModel,
  permissions: FieldPermissions
): void {
  Object.entries(permissions).forEach(([fieldName, permission]) => {
    const question = survey.getQuestionByName(fieldName);
    
    if (!question) {
      console.warn(`Field ${fieldName} not found in survey`);
      return;
    }

    switch (permission) {
      case 'readonly':
        question.readOnly = true;
        question.cssClasses.root = 'field-readonly';
        break;
        
      case 'hidden':
        question.visible = false;
        break;
        
      case 'required':
        question.isRequired = true;
        break;
        
      case 'editable':
      default:
        question.readOnly = false;
        question.visible = true;
        break;
    }
  });
}

export function extractEditableFields(
  data: Record<string, any>,
  permissions: FieldPermissions
): Record<string, any> {
  const editableData: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (permissions[key] === 'editable' || permissions[key] === 'required') {
      editableData[key] = value;
    }
  });
  
  return editableData;
}
```

### Step-Aware Form Page

```tsx
// pages/WorkflowFormPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Survey } from 'survey-react-ui';
import { Model as SurveyModel } from 'survey-core';
import { applyPermissionsToSurvey, extractEditableFields } from '../services/formPermissions';
import api from '../services/api';

const WorkflowFormPage: React.FC = () => {
  const { submissionId } = useParams();
  const [searchParams] = useSearchParams();
  const stepName = searchParams.get('step');
  
  const [survey, setSurvey] = useState<SurveyModel | null>(null);
  const [permissions, setPermissions] = useState<FieldPermissions>({});
  const [stepInfo, setStepInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissionWithPermissions();
  }, [submissionId, stepName]);

  const loadSubmissionWithPermissions = async () => {
    try {
      // Get form schema
      const formResponse = await api.get(`/forms/${formSlug}`);
      const schema = formResponse.data.schema;

      // Get submission with permissions for current step
      const subResponse = await api.get(
        `/submissions/${submissionId}?step=${stepName}`
      );
      
      const { submission, field_permissions, step_info } = subResponse.data;

      // Create survey model
      const surveyModel = new SurveyModel(schema);
      
      // Load existing data
      surveyModel.data = submission.data;
      
      // Apply step-based permissions
      applyPermissionsToSurvey(surveyModel, field_permissions);
      
      setSurvey(surveyModel);
      setPermissions(field_permissions);
      setStepInfo(step_info);
    } catch (error) {
      console.error('Failed to load submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (action: 'approve' | 'reject') => {
    if (!survey) return;

    // Extract only editable fields
    const fieldUpdates = extractEditableFields(survey.data, permissions);

    try {
      await api.post(`/submissions/${submissionId}/steps/${stepName}/complete`, {
        action,
        field_updates: fieldUpdates,
        comments: survey.data.step_comments || ''
      });

      // Navigate to success or task list
      navigate('/workflow/my-tasks');
    } catch (error) {
      console.error('Failed to complete step:', error);
    }
  };

  if (loading) return <BusyIndicator />;

  return (
    <div className="workflow-form-page">
      {/* Step indicator */}
      <StepProgressBar 
        steps={['clerk_entry', 'manager_review', 'hr_verify', 'director_approval']}
        currentStep={stepName}
      />

      {/* Step info banner */}
      <MessageStrip design="Information">
        You are reviewing as: {stepInfo.assigned_to} | 
        Due: {formatDate(stepInfo.due_date)}
      </MessageStrip>

      {/* Survey form */}
      <Survey model={survey} />

      {/* Action buttons */}
      <FlexBox justifyContent="End" style={{ gap: '1rem', marginTop: '1rem' }}>
        <Button design="Negative" onClick={() => handleComplete('reject')}>
          Reject
        </Button>
        <Button design="Positive" onClick={() => handleComplete('approve')}>
          Approve & Continue
        </Button>
      </FlexBox>
    </div>
  );
};
```

### Readonly Field Styling

```css
/* styles/workflow.css */

.field-readonly {
  background-color: #f5f5f5;
  border-color: #e0e0e0;
}

.field-readonly input,
.field-readonly textarea,
.field-readonly select {
  cursor: not-allowed;
  opacity: 0.8;
}

.field-readonly label::after {
  content: ' (readonly)';
  font-size: 0.8em;
  color: #888;
}
```

---

## Admin UI for Step Permissions

### Form Step Permissions Page

```tsx
// pages/admin/FormStepPermissionsPage.tsx

// Features:
// 1. Select form from dropdown
// 2. Show all workflow steps for that form
// 3. For each step, show matrix of fields × permissions
// 4. Drag-drop or checkboxes to set permissions
// 5. Save configuration

// UI Layout:
// ┌─────────────────────────────────────────────────────────────────┐
// │ Form: [Loan Application ▼]                                      │
// ├─────────────────────────────────────────────────────────────────┤
// │ Step: [clerk_entry] [manager_review] [hr_verify] [director]     │
// ├─────────────────────────────────────────────────────────────────┤
// │                    │ Editable │ Readonly │ Hidden │ Required │  │
// │ customer_name      │    ○     │    ●     │   ○    │    ○     │  │
// │ requested_amount   │    ○     │    ●     │   ○    │    ○     │  │
// │ accepted_amount    │    ●     │    ○     │   ○    │    ○     │  │
// │ manager_comments   │    ●     │    ○     │   ○    │    ○     │  │
// │ employment_verified│    ○     │    ○     │   ●    │    ○     │  │
// └─────────────────────────────────────────────────────────────────┘
```

---

## Query Examples

### Get All Pending Tasks for a User/Role

```sql
SELECT 
  s.id as submission_id,
  f.name as form_name,
  f.name_fa as form_name_fa,
  a.step_name,
  a.assigned_to,
  a.due_date,
  s.data->>'customer_name' as customer_name,
  s.created_at as submitted_at
FROM approval_steps a
JOIN submissions s ON a.submission_id = s.id
JOIN forms f ON s.form_id = f.id
WHERE a.status = 'pending'
  AND (a.assigned_to = 'managers' OR a.assigned_user = 'manager@company.com')
ORDER BY a.due_date ASC NULLS LAST;
```

### Get Approval History for a Submission

```sql
SELECT 
  step_name,
  step_order,
  status,
  acted_by,
  acted_at,
  comments,
  field_changes
FROM approval_steps
WHERE submission_id = 'sub-001'
ORDER BY step_order;
```

### Get Overdue Tasks

```sql
SELECT 
  s.id,
  f.name as form_name,
  a.step_name,
  a.assigned_to,
  a.due_date,
  NOW() - a.due_date as overdue_by
FROM approval_steps a
JOIN submissions s ON a.submission_id = s.id
JOIN forms f ON s.form_id = f.id
WHERE a.status = 'pending'
  AND a.due_date < NOW()
ORDER BY a.due_date;
```

### Approval Statistics

```sql
SELECT 
  f.name as form_name,
  COUNT(*) as total_submissions,
  COUNT(*) FILTER (WHERE s.workflow_status = 'approved') as approved,
  COUNT(*) FILTER (WHERE s.workflow_status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE s.workflow_status = 'in_progress') as in_progress,
  AVG(s.completed_at - s.created_at) as avg_completion_time
FROM submissions s
JOIN forms f ON s.form_id = f.id
WHERE s.workflow_status != 'draft'
GROUP BY f.id, f.name;
```

---

## BPMN Integration

### How Zeebe Interacts

```xml
<!-- leave-request.bpmn -->
<bpmn:process id="loan-approval-process" name="Loan Approval">
  
  <!-- Start: receives submissionId -->
  <bpmn:startEvent id="start">
    <bpmn:outgoing>to-manager</bpmn:outgoing>
  </bpmn:startEvent>

  <!-- Manager Review Task -->
  <bpmn:userTask id="manager-review" name="Manager Review">
    <bpmn:extensionElements>
      <zeebe:taskDefinition type="approval-task" />
      <zeebe:taskHeaders>
        <zeebe:header key="stepName" value="manager_review" />
      </zeebe:taskHeaders>
    </bpmn:extensionElements>
    <bpmn:incoming>to-manager</bpmn:incoming>
    <bpmn:outgoing>manager-decision</bpmn:outgoing>
  </bpmn:userTask>

  <!-- Gateway: Manager Decision -->
  <bpmn:exclusiveGateway id="manager-gateway">
    <bpmn:incoming>manager-decision</bpmn:incoming>
    <bpmn:outgoing>to-hr</bpmn:outgoing>
    <bpmn:outgoing>to-rejected</bpmn:outgoing>
  </bpmn:exclusiveGateway>

  <!-- Continue to HR if approved -->
  <bpmn:sequenceFlow id="to-hr" sourceRef="manager-gateway" targetRef="hr-verify">
    <bpmn:conditionExpression>= approved = true</bpmn:conditionExpression>
  </bpmn:sequenceFlow>

  <!-- Similar pattern for HR, Director... -->
  
</bpmn:process>
```

### Zeebe Job Worker (Backend)

```typescript
// workers/approvalWorker.ts

import { ZBClient } from 'zeebe-node';

const client = new ZBClient('localhost:26500');

// This worker doesn't DO the approval - it just updates Zeebe
// when PostgreSQL approval_steps changes

client.createWorker({
  taskType: 'approval-task',
  taskHandler: async (job) => {
    const { submissionId } = job.variables;
    const stepName = job.customHeaders.stepName;

    // Poll PostgreSQL for completion (or use webhook/event)
    // This is just for Zeebe routing - actual data is in PostgreSQL
    
    const step = await getApprovalStep(submissionId, stepName);
    
    if (step.status === 'pending') {
      // Not ready yet - fail job to retry later
      return job.fail('Step not completed yet');
    }

    // Complete job with decision (for gateway routing)
    return job.complete({
      approved: step.status === 'approved'
    });
  }
});
```

---

## Implementation Phases

### Phase 18 (Current): Basic Workflow
- [x] Zeebe connection
- [x] Start process on form submit
- [x] Basic status tracking
- [ ] Simple approval_steps table

### Phase 19: Multi-Level Approval
- [ ] Full approval_steps implementation
- [ ] My Tasks API
- [ ] Task list UI in SYNCRO
- [ ] Complete step API

### Phase 20: Step-Based Field Permissions
- [ ] form_step_permissions table
- [ ] Permission-aware form rendering
- [ ] Field change tracking
- [ ] Admin UI for configuring permissions

### Phase 21: Advanced Features
- [ ] Due dates and escalation
- [ ] Email notifications
- [ ] Delegation (reassign task)
- [ ] Parallel approvals
- [ ] Conditional steps (skip HR if amount < X)

---

## Security Considerations

1. **Permission Validation**: Backend MUST validate user can access step
2. **Field Validation**: Backend MUST reject updates to non-editable fields
3. **Audit Trail**: All changes logged in field_changes
4. **Role-Based Access**: Use Keycloak roles for step assignment
5. **Data Isolation**: Users only see submissions they're assigned to

---

## Migration Path

When implementing, create these migrations in order:

```
020_add_workflow_columns.sql        -- Basic workflow fields
021_create_approval_steps.sql       -- Approval tracking table
022_create_step_permissions.sql     -- Field permissions table
023_add_audit_fields.sql            -- field_changes, timestamps
```

---

## Testing Scenarios

1. **Happy Path**: Form → All approvals → Completed
2. **Rejection**: Form → Manager rejects → Status = rejected
3. **Multi-Editor**: Each step adds different fields
4. **Permission Check**: Try to edit readonly field → Error
5. **Audit Trail**: Verify field_changes at each step
6. **Concurrent**: Two managers try to approve same task
7. **Timeout**: Task overdue → Escalation triggered

---

## References

- SurveyJS Readonly: https://surveyjs.io/form-library/documentation/design-survey/conditional-logic
- Zeebe Node: https://github.com/camunda/zeebe-node
- Camunda Tasklist: https://docs.camunda.io/docs/components/tasklist/

---

*Last Updated: 2025-12-25*
*Status: PLANNED - Do not implement until Phase 20+*
