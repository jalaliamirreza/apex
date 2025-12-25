# PHASE 18: Form → Workflow Integration

## Overview

Connect SYNCRO form submissions to Camunda 8 workflows. When a user submits a form that has workflow enabled, automatically start a Zeebe process instance.

**Key Principle: PostgreSQL = Single Source of Truth**
- Zeebe only receives `submissionId` as reference
- All form data stays in PostgreSQL
- Workflow decisions written back to PostgreSQL
- Zeebe is orchestrator only (traffic controller)

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   SYNCRO Form   │────▶│  Backend API    │────▶│  Zeebe Engine   │
│   (SurveyJS)    │     │  /submissions   │     │  :26500         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                       │
         │                      ▼                       │
         │               ┌─────────────┐                │
         │               │ PostgreSQL  │◄───────────────┘
         │               │   (SSOT)    │   only submissionId
         │               └─────────────┘
         │                      │
         └──────────────────────┘
                 ALL DATA HERE
```

### What Goes Where

| Location | Stores |
|----------|--------|
| **PostgreSQL** | Form data, approval decisions, audit trail, status |
| **Zeebe** | `{submissionId}` reference only, process state |

### Flow

1. User fills and submits SurveyJS form
2. Backend saves submission to PostgreSQL (all form data)
3. Backend checks if form.workflow_enabled = true
4. If yes → call Zeebe with `{submissionId}` only
5. Save process_instance_key to submission record
6. Zeebe creates user task
7. User completes task → PostgreSQL updated with decision
8. Zeebe routes to next step (if any)

---

## Part 1: Database Migration

### File: `backend/migrations/020_add_workflow_columns.sql`

```sql
-- ============================================
-- PHASE 18: Workflow Integration Schema
-- ============================================

-- 1. Add workflow configuration to forms table
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS workflow_process_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS workflow_enabled BOOLEAN DEFAULT false;

COMMENT ON COLUMN forms.workflow_process_id IS 'BPMN process ID in Zeebe (e.g., leave-request-process)';
COMMENT ON COLUMN forms.workflow_enabled IS 'When true, form submission starts a workflow';

-- 2. Add workflow tracking to submissions table
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS process_instance_key BIGINT,
ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS current_step VARCHAR(100),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Add constraint for workflow_status
ALTER TABLE submissions 
ADD CONSTRAINT chk_workflow_status 
CHECK (workflow_status IN ('draft', 'pending', 'in_progress', 'approved', 'rejected', 'canceled'));

COMMENT ON COLUMN submissions.process_instance_key IS 'Reference to Zeebe process instance (for linking only)';
COMMENT ON COLUMN submissions.workflow_status IS 'Current workflow state';
COMMENT ON COLUMN submissions.current_step IS 'Current approval step name';

-- 3. Create approval_steps table for audit trail
CREATE TABLE IF NOT EXISTS approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL,
  step_order INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Assignment
  assigned_to VARCHAR(255),
  
  -- Action tracking  
  acted_by VARCHAR(255),
  acted_at TIMESTAMP,
  comments TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT chk_step_status CHECK (status IN ('pending', 'approved', 'rejected', 'skipped', 'canceled')),
  CONSTRAINT uq_submission_step UNIQUE (submission_id, step_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_process_key 
ON submissions(process_instance_key) 
WHERE process_instance_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_submissions_workflow_status 
ON submissions(workflow_status);

CREATE INDEX IF NOT EXISTS idx_approval_steps_submission 
ON approval_steps(submission_id);

CREATE INDEX IF NOT EXISTS idx_approval_steps_pending 
ON approval_steps(status, step_name) 
WHERE status = 'pending';

-- ============================================
-- Verification queries (run after migration)
-- ============================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'forms' AND column_name LIKE 'workflow%';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'submissions' AND column_name IN ('process_instance_key', 'workflow_status', 'current_step');
-- SELECT * FROM information_schema.tables WHERE table_name = 'approval_steps';
```

### Run Migration

```bash
docker exec -i apex-postgres psql -U apex -d apex < backend/migrations/020_add_workflow_columns.sql
```

---

## Part 2: Install Zeebe Node Client

```bash
cd backend && npm install zeebe-node
```

---

## Part 3: Zeebe Service

### File: `backend/src/services/zeebe.service.ts`

```typescript
import { ZBClient } from 'zeebe-node';
import { logger } from '../utils/logger';

class ZeebeService {
  private client: ZBClient | null = null;
  private readonly gatewayAddress: string;

  constructor() {
    this.gatewayAddress = process.env.ZEEBE_ADDRESS || 'localhost:26500';
  }

  /**
   * Get or create Zeebe client (lazy initialization)
   */
  private getClient(): ZBClient {
    if (!this.client) {
      this.client = new ZBClient(this.gatewayAddress, {
        usePlaintext: true,
      });
      logger.info(`Zeebe client connected to ${this.gatewayAddress}`);
    }
    return this.client;
  }

  /**
   * Start a workflow process instance
   * 
   * IMPORTANT: Only pass submissionId as reference!
   * All actual data stays in PostgreSQL (single source of truth)
   * 
   * @param processId - BPMN process ID (e.g., 'leave-request-process')
   * @param submissionId - UUID of the submission in PostgreSQL
   * @param metadata - Minimal metadata for routing (no form data!)
   */
  async startProcess(
    processId: string,
    submissionId: string,
    metadata: {
      formSlug: string;
      submittedBy: string;
    }
  ): Promise<{ processInstanceKey: string }> {
    try {
      const client = this.getClient();

      // ONLY pass reference - no form data!
      const result = await client.createProcessInstance({
        bpmnProcessId: processId,
        variables: {
          submissionId: submissionId,
          formSlug: metadata.formSlug,
          submittedBy: metadata.submittedBy,
          submittedAt: new Date().toISOString(),
        },
      });

      logger.info(`Started process ${processId}, instance: ${result.processInstanceKey}, submission: ${submissionId}`);

      return {
        processInstanceKey: result.processInstanceKey.toString(),
      };
    } catch (error) {
      logger.error(`Failed to start process ${processId}:`, error);
      throw error;
    }
  }

  /**
   * Check if Zeebe is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const client = this.getClient();
      await client.topology();
      return true;
    } catch (error) {
      logger.error('Zeebe health check failed:', error);
      return false;
    }
  }

  /**
   * Close the client connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      logger.info('Zeebe client closed');
    }
  }
}

export const zeebeService = new ZeebeService();
```

---

## Part 4: Update Submission Service

### File: `backend/src/services/submission.service.ts`

```typescript
import { pool } from '../config/database';
import { zeebeService } from './zeebe.service';
import { logger } from '../utils/logger';

interface SubmissionResult {
  id: string;
  form_id: string;
  data: any;
  submitted_by: string;
  created_at: Date;
  process_instance_key?: string;
  workflow_status: string;
  current_step?: string;
}

interface FormWorkflowConfig {
  id: string;
  slug: string;
  workflow_enabled: boolean;
  workflow_process_id: string | null;
}

/**
 * Get form with workflow configuration
 */
async function getFormWithWorkflow(formId: string): Promise<FormWorkflowConfig | null> {
  const result = await pool.query(
    'SELECT id, slug, workflow_enabled, workflow_process_id FROM forms WHERE id = $1',
    [formId]
  );
  return result.rows[0] || null;
}

/**
 * Create initial approval steps for a submission
 */
async function createApprovalSteps(submissionId: string, processId: string): Promise<void> {
  // For now, create a simple single-step approval
  // Later this can be configured per form/process
  await pool.query(
    `INSERT INTO approval_steps (submission_id, step_name, step_order, status, assigned_to)
     VALUES ($1, 'manager_review', 1, 'pending', 'managers')`,
    [submissionId]
  );
}

/**
 * Create a new submission and optionally start workflow
 */
export async function createSubmission(
  formId: string,
  data: any,
  submittedBy?: string
): Promise<SubmissionResult> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Insert submission with initial status
    const insertResult = await client.query(
      `INSERT INTO submissions (form_id, data, submitted_by, workflow_status, created_at)
       VALUES ($1, $2, $3, 'draft', NOW())
       RETURNING id, form_id, data, submitted_by, created_at, workflow_status`,
      [formId, JSON.stringify(data), submittedBy || 'anonymous']
    );

    const submission = insertResult.rows[0];
    let processInstanceKey: string | null = null;

    // 2. Check if workflow is enabled
    const formConfig = await getFormWithWorkflow(formId);

    if (formConfig?.workflow_enabled && formConfig.workflow_process_id) {
      try {
        // 3. Start Zeebe process with ONLY submissionId reference
        const processResult = await zeebeService.startProcess(
          formConfig.workflow_process_id,
          submission.id,
          {
            formSlug: formConfig.slug,
            submittedBy: submittedBy || 'anonymous',
          }
        );

        processInstanceKey = processResult.processInstanceKey;

        // 4. Update submission with workflow info
        await client.query(
          `UPDATE submissions 
           SET process_instance_key = $1, 
               workflow_status = 'in_progress',
               current_step = 'manager_review'
           WHERE id = $2`,
          [processInstanceKey, submission.id]
        );

        // 5. Create approval steps
        await createApprovalSteps(submission.id, formConfig.workflow_process_id);

        submission.workflow_status = 'in_progress';
        submission.current_step = 'manager_review';

        logger.info(`Submission ${submission.id} started workflow, process: ${processInstanceKey}`);
      } catch (error) {
        // Log error but don't fail the submission
        logger.error(`Failed to start workflow for submission ${submission.id}:`, error);
        
        await client.query(
          `UPDATE submissions SET workflow_status = 'pending' WHERE id = $1`,
          [submission.id]
        );
        submission.workflow_status = 'pending';
      }
    }

    await client.query('COMMIT');

    return {
      ...submission,
      process_instance_key: processInstanceKey,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get submissions for a form (include workflow info)
 */
export async function getSubmissions(formId: string): Promise<SubmissionResult[]> {
  const result = await pool.query(
    `SELECT id, form_id, data, submitted_by, created_at,
            process_instance_key, workflow_status, current_step
     FROM submissions
     WHERE form_id = $1
     ORDER BY created_at DESC`,
    [formId]
  );
  return result.rows;
}

/**
 * Get single submission by ID with approval history
 */
export async function getSubmissionById(id: string): Promise<any | null> {
  const subResult = await pool.query(
    `SELECT id, form_id, data, submitted_by, created_at,
            process_instance_key, workflow_status, current_step, completed_at
     FROM submissions WHERE id = $1`,
    [id]
  );

  if (!subResult.rows[0]) return null;

  const stepsResult = await pool.query(
    `SELECT step_name, step_order, status, assigned_to, acted_by, acted_at, comments
     FROM approval_steps
     WHERE submission_id = $1
     ORDER BY step_order`,
    [id]
  );

  return {
    ...subResult.rows[0],
    approval_steps: stepsResult.rows,
  };
}

/**
 * Complete an approval step
 */
export async function completeApprovalStep(
  submissionId: string,
  stepName: string,
  action: 'approve' | 'reject',
  actedBy: string,
  comments?: string
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update approval step
    await client.query(
      `UPDATE approval_steps
       SET status = $1, acted_by = $2, acted_at = NOW(), comments = $3
       WHERE submission_id = $4 AND step_name = $5`,
      [action === 'approve' ? 'approved' : 'rejected', actedBy, comments, submissionId, stepName]
    );

    // Update submission status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await client.query(
      `UPDATE submissions
       SET workflow_status = $1, current_step = NULL, completed_at = NOW()
       WHERE id = $2`,
      [newStatus, submissionId]
    );

    await client.query('COMMIT');

    logger.info(`Submission ${submissionId} step ${stepName} ${action}ed by ${actedBy}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

---

## Part 5: Update Form Service

### File: `backend/src/services/form.service.ts`

Add to existing service:

```typescript
/**
 * Get form by slug with workflow info
 */
export async function getFormBySlug(slug: string): Promise<any | null> {
  const result = await pool.query(
    `SELECT id, slug, name, name_fa, description, schema, status,
            section_id, icon, color, order_index, direction,
            workflow_enabled, workflow_process_id
     FROM forms WHERE slug = $1`,
    [slug]
  );
  return result.rows[0] || null;
}

/**
 * Update workflow settings for a form
 */
export async function updateFormWorkflow(
  formId: string,
  workflowEnabled: boolean,
  workflowProcessId: string | null
): Promise<void> {
  await pool.query(
    `UPDATE forms
     SET workflow_enabled = $1, workflow_process_id = $2
     WHERE id = $3`,
    [workflowEnabled, workflowProcessId, formId]
  );
}

/**
 * Get all forms with workflow info (for admin)
 */
export async function getAllFormsWithWorkflow(): Promise<any[]> {
  const result = await pool.query(
    `SELECT id, slug, name, name_fa, status,
            workflow_enabled, workflow_process_id
     FROM forms ORDER BY name`
  );
  return result.rows;
}
```

---

## Part 6: Workflow API Routes

### File: `backend/src/routes/workflow.routes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { zeebeService } from '../services/zeebe.service';
import { 
  updateFormWorkflow, 
  getAllFormsWithWorkflow 
} from '../services/form.service';
import {
  getSubmissionById,
  completeApprovalStep
} from '../services/submission.service';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/v1/workflow/health
 * Check Zeebe connection status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthy = await zeebeService.healthCheck();
    res.json({
      status: healthy ? 'connected' : 'disconnected',
      gateway: process.env.ZEEBE_ADDRESS || 'localhost:26500',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: String(error) });
  }
});

/**
 * GET /api/v1/workflow/forms
 * Get all forms with their workflow configuration
 */
router.get('/forms', async (req: Request, res: Response) => {
  try {
    const forms = await getAllFormsWithWorkflow();
    res.json({ forms });
  } catch (error) {
    logger.error('Failed to get forms with workflow:', error);
    res.status(500).json({ error: 'Failed to get forms' });
  }
});

/**
 * PUT /api/v1/workflow/forms/:id
 * Update workflow settings for a form
 */
router.put('/forms/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { workflow_enabled, workflow_process_id } = req.body;

    await updateFormWorkflow(
      id,
      workflow_enabled === true,
      workflow_process_id || null
    );

    res.json({
      success: true,
      message: 'Workflow settings updated',
    });
  } catch (error) {
    logger.error('Failed to update form workflow:', error);
    res.status(500).json({ error: 'Failed to update workflow settings' });
  }
});

/**
 * GET /api/v1/workflow/my-tasks
 * Get pending tasks (for current user/role)
 */
router.get('/my-tasks', async (req: Request, res: Response) => {
  try {
    // For now, return all pending tasks
    // Later: filter by user/role from auth
    const result = await pool.query(
      `SELECT 
        s.id as submission_id,
        f.name as form_name,
        f.name_fa as form_name_fa,
        f.slug as form_slug,
        a.step_name,
        a.assigned_to,
        s.submitted_by,
        s.created_at as submitted_at,
        s.data
       FROM approval_steps a
       JOIN submissions s ON a.submission_id = s.id
       JOIN forms f ON s.form_id = f.id
       WHERE a.status = 'pending'
       ORDER BY s.created_at DESC`
    );

    res.json({ tasks: result.rows });
  } catch (error) {
    logger.error('Failed to get tasks:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

/**
 * GET /api/v1/workflow/submissions/:id
 * Get submission with full details for workflow view
 */
router.get('/submissions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await getSubmissionById(id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({ submission });
  } catch (error) {
    logger.error('Failed to get submission:', error);
    res.status(500).json({ error: 'Failed to get submission' });
  }
});

/**
 * POST /api/v1/workflow/submissions/:id/steps/:stepName/complete
 * Complete an approval step
 */
router.post('/submissions/:id/steps/:stepName/complete', async (req: Request, res: Response) => {
  try {
    const { id, stepName } = req.params;
    const { action, comments } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be approve or reject' });
    }

    // TODO: Get actual user from auth
    const actedBy = req.body.acted_by || 'admin@company.com';

    await completeApprovalStep(id, stepName, action, actedBy, comments);

    res.json({
      success: true,
      message: `Step ${stepName} ${action}ed`,
    });
  } catch (error) {
    logger.error('Failed to complete step:', error);
    res.status(500).json({ error: 'Failed to complete step' });
  }
});

export default router;
```

### Register in `backend/src/routes/index.ts`

```typescript
import workflowRoutes from './workflow.routes';

// Add with other routes
router.use('/workflow', workflowRoutes);
```

---

## Part 7: Frontend - Workflow Configuration Page

### File: `frontend/src/pages/admin/ManageFormsWorkflowPage.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import {
  FlexBox,
  Title,
  Table,
  TableColumn,
  TableRow,
  TableCell,
  Switch,
  Input,
  Button,
  MessageStrip,
  BusyIndicator,
  Icon,
} from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface FormWorkflow {
  id: string;
  slug: string;
  name: string;
  name_fa: string;
  status: string;
  workflow_enabled: boolean;
  workflow_process_id: string | null;
}

const ManageFormsWorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [zeebeStatus, setZeebeStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check Zeebe health
      const healthRes = await api.get('/workflow/health');
      setZeebeStatus(healthRes.data.status);

      // Load forms
      const formsRes = await api.get('/workflow/forms');
      setForms(formsRes.data.forms);
    } catch (err) {
      setError('Failed to load data');
      setZeebeStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkflow = async (form: FormWorkflow) => {
    if (!form.workflow_process_id && !form.workflow_enabled) {
      setError('Please set Process ID first');
      return;
    }

    try {
      setSaving(form.id);
      await api.put(`/workflow/forms/${form.id}`, {
        workflow_enabled: !form.workflow_enabled,
        workflow_process_id: form.workflow_process_id,
      });
      setForms(forms.map(f =>
        f.id === form.id
          ? { ...f, workflow_enabled: !f.workflow_enabled }
          : f
      ));
      setSuccess(`Workflow ${!form.workflow_enabled ? 'enabled' : 'disabled'} for ${form.name}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update workflow');
    } finally {
      setSaving(null);
    }
  };

  const handleProcessIdChange = async (form: FormWorkflow, processId: string) => {
    try {
      setSaving(form.id);
      await api.put(`/workflow/forms/${form.id}`, {
        workflow_enabled: form.workflow_enabled,
        workflow_process_id: processId || null,
      });
      setForms(forms.map(f =>
        f.id === form.id
          ? { ...f, workflow_process_id: processId || null }
          : f
      ));
    } catch (err) {
      setError('Failed to update process ID');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <FlexBox justifyContent="Center" alignItems="Center" style={{ height: '100vh' }}>
        <BusyIndicator active size="Large" />
      </FlexBox>
    );
  }

  return (
    <FlexBox direction="Column" style={{ padding: '1rem', gap: '1rem', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <FlexBox justifyContent="SpaceBetween" alignItems="Center" style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px' }}>
        <FlexBox alignItems="Center" style={{ gap: '1rem' }}>
          <Button icon="nav-back" design="Transparent" onClick={() => navigate('/launchpad/admin')} />
          <Icon name="process" style={{ fontSize: '1.5rem', color: '#6366f1' }} />
          <div>
            <Title level="H3">Form Workflow Configuration</Title>
            <Title level="H5" style={{ color: '#666', direction: 'rtl' }}>پیکربندی گردش کار فرم‌ها</Title>
          </div>
        </FlexBox>
        
        {/* Zeebe Status */}
        <FlexBox alignItems="Center" style={{ gap: '0.5rem' }}>
          <span style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%', 
            backgroundColor: zeebeStatus === 'connected' ? '#10b981' : '#ef4444' 
          }} />
          <span style={{ fontSize: '0.875rem', color: '#666' }}>
            Zeebe: {zeebeStatus}
          </span>
        </FlexBox>
      </FlexBox>

      {/* Messages */}
      {error && (
        <MessageStrip design="Negative" onClose={() => setError(null)}>
          {error}
        </MessageStrip>
      )}
      {success && (
        <MessageStrip design="Positive" onClose={() => setSuccess(null)}>
          {success}
        </MessageStrip>
      )}

      {/* Info */}
      <MessageStrip design="Information" hideCloseButton>
        Enable workflow to automatically start a Camunda process when form is submitted.
        Process ID must match a deployed BPMN process (e.g., "leave-request-process").
      </MessageStrip>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        <Table>
          <TableColumn slot="columns">Form Name</TableColumn>
          <TableColumn slot="columns" style={{ direction: 'rtl' }}>نام فرم</TableColumn>
          <TableColumn slot="columns">Slug</TableColumn>
          <TableColumn slot="columns">Workflow Enabled</TableColumn>
          <TableColumn slot="columns">Process ID</TableColumn>
        </Table>

        {forms.map(form => (
          <TableRow key={form.id}>
            <TableCell>{form.name}</TableCell>
            <TableCell style={{ direction: 'rtl' }}>{form.name_fa}</TableCell>
            <TableCell><code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{form.slug}</code></TableCell>
            <TableCell>
              <Switch
                checked={form.workflow_enabled}
                onChange={() => handleToggleWorkflow(form)}
                disabled={saving === form.id || zeebeStatus !== 'connected'}
              />
            </TableCell>
            <TableCell>
              <Input
                value={form.workflow_process_id || ''}
                placeholder="e.g., leave-request-process"
                onBlur={(e) => handleProcessIdChange(form, (e.target as HTMLInputElement).value)}
                disabled={saving === form.id}
                style={{ width: '250px' }}
              />
            </TableCell>
          </TableRow>
        ))}
      </div>
    </FlexBox>
  );
};

export default ManageFormsWorkflowPage;
```

---

## Part 8: Add Route and Tile

### File: `frontend/src/App.tsx`

Add route:

```tsx
import ManageFormsWorkflowPage from './pages/admin/ManageFormsWorkflowPage';

// In Routes:
<Route path="/app/manage-forms-workflow" element={<ManageFormsWorkflowPage />} />
```

### Migration: Add Admin Tile

### File: `backend/migrations/021_add_workflow_tile.sql`

```sql
-- Add workflow configuration tile to admin section
INSERT INTO tiles (id, section_id, name, name_fa, slug, description, icon, color, type, order_index, direction, config, is_active)
SELECT
  gen_random_uuid(),
  s.id,
  'Form Workflows',
  'گردش کار فرم‌ها',
  'manage-forms-workflow',
  'Configure workflow automation for forms',
  'process',
  '#6366f1',
  'app',
  7,
  'ltr',
  '{"route": "/app/manage-forms-workflow"}'::jsonb,
  true
FROM sections s
JOIN pages p ON s.page_id = p.id
JOIN spaces sp ON p.space_id = sp.id
WHERE sp.slug = 'admin' AND p.slug = 'system' AND s.name = 'System Management'
ON CONFLICT DO NOTHING;
```

---

## Part 9: Environment Variables

### File: `backend/.env`

```env
# Camunda Zeebe
ZEEBE_ADDRESS=localhost:26500
```

---

## Implementation Order

1. Create `backend/migrations/020_add_workflow_columns.sql`
2. Run migration: `docker exec -i apex-postgres psql -U apex -d apex < backend/migrations/020_add_workflow_columns.sql`
3. Install zeebe-node: `cd backend && npm install zeebe-node`
4. Create `backend/src/services/zeebe.service.ts`
5. Create/Update `backend/src/services/submission.service.ts`
6. Update `backend/src/services/form.service.ts`
7. Create `backend/src/routes/workflow.routes.ts`
8. Register workflow routes in `backend/src/routes/index.ts`
9. Create `frontend/src/pages/admin/ManageFormsWorkflowPage.tsx`
10. Add route in `frontend/src/App.tsx`
11. Create and run `backend/migrations/021_add_workflow_tile.sql`
12. Rebuild backend: `docker-compose build backend && docker-compose up -d backend`
13. Rebuild frontend: `docker-compose build frontend && docker-compose up -d frontend`

---

## Testing Checklist

- [ ] Migration runs without errors
- [ ] `curl http://localhost:3001/api/v1/workflow/health` returns connected
- [ ] `curl http://localhost:3001/api/v1/workflow/forms` returns forms list
- [ ] Admin page loads at `/app/manage-forms-workflow`
- [ ] Zeebe status shows "connected"
- [ ] Can enable workflow for a form
- [ ] Can set Process ID (e.g., `leave-request-process`)
- [ ] Submit form with workflow enabled
- [ ] Check Operate (http://localhost:8081) - new process instance
- [ ] Check submissions table - has `process_instance_key`
- [ ] Check approval_steps table - has pending step
- [ ] `curl http://localhost:3001/api/v1/workflow/my-tasks` shows task

---

## Test Scenario

1. Go to Admin → Form Workflows (`/app/manage-forms-workflow`)
2. Find a test form (e.g., "Leave Request")
3. Set Process ID to `leave-request-process`
4. Enable workflow toggle
5. Go to launchpad, open the form, submit
6. Check:
   - Operate: new process instance with submissionId variable
   - PostgreSQL: `SELECT * FROM submissions ORDER BY created_at DESC LIMIT 1;`
   - PostgreSQL: `SELECT * FROM approval_steps ORDER BY created_at DESC LIMIT 1;`
7. Complete the task via API:
   ```bash
   curl -X POST http://localhost:3001/api/v1/workflow/submissions/{id}/steps/manager_review/complete \
     -H "Content-Type: application/json" \
     -d '{"action": "approve", "comments": "Looks good"}'
   ```

---

## Key Principles (Reference for Future)

1. **PostgreSQL = Single Source of Truth**
   - All form data stored in PostgreSQL
   - All approval decisions stored in PostgreSQL
   - Zeebe only has `submissionId` reference

2. **Zeebe = Orchestrator Only**
   - Tracks which step is current
   - Routes to next step
   - Creates user tasks
   - Does NOT store business data

3. **Audit Trail in approval_steps**
   - Who approved/rejected
   - When
   - Comments
   - (Future: field_changes)

4. **See FUTURE-MULTI-LEVEL-APPROVAL-SPEC.md for:**
   - Multi-level approval chains
   - Step-based field permissions
   - Field change tracking

---

## Claude Code Prompt

```
Read PHASE18-FORM-WORKFLOW-INTEGRATION.md and implement all parts in order:

1. Create backend/migrations/020_add_workflow_columns.sql
2. Run: docker exec -i apex-postgres psql -U apex -d apex < backend/migrations/020_add_workflow_columns.sql
3. Run: cd backend && npm install zeebe-node
4. Create backend/src/services/zeebe.service.ts
5. Update backend/src/services/submission.service.ts with workflow integration
6. Update backend/src/services/form.service.ts with workflow fields
7. Create backend/src/routes/workflow.routes.ts
8. Register workflow routes in backend/src/routes/index.ts
9. Create frontend/src/pages/admin/ManageFormsWorkflowPage.tsx
10. Add route in frontend/src/App.tsx for /app/manage-forms-workflow
11. Create and run backend/migrations/021_add_workflow_tile.sql
12. Rebuild: docker-compose build backend frontend && docker-compose up -d

Test: curl http://localhost:3001/api/v1/workflow/health
```
