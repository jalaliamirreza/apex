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
