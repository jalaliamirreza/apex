export interface Form {
  id: string;
  slug: string;
  name: string;
  description?: string;
  schema: { components: any[] };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedBy?: string;
  submittedAt: string;
}

export interface SearchResult {
  submissionId: string;
  formSlug: string;
  formName: string;
  data: Record<string, any>;
  submittedAt: string;
  highlights: string[];
  score: number;
}
