export interface Submission {
  id: string;
  formId: string;
  data: Record<string, any>;
  files?: string[];
  submittedBy?: string;
  submittedAt: Date;
}

export interface CreateSubmissionInput {
  data: Record<string, any>;
  files?: string[];
}
