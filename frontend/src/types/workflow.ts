export interface Task {
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

export interface Submission {
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

export interface CompletedTask {
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

export interface SubmissionDetail {
  id: string;
  form_id: string;
  form_name: string;
  form_name_fa: string;
  form_slug: string;
  data: Record<string, any>;
  submitted_by: string;
  submitted_at: string;
  workflow_status: string;
  current_step: string | null;
  completed_at: string | null;
  approval_steps: ApprovalStep[];
}

export interface ApprovalStep {
  step_name: string;
  step_order: number;
  status: string;
  assigned_to: string | null;
  acted_by: string | null;
  acted_at: string | null;
  comments: string | null;
}
