import api from './api';
import { Task, Submission, CompletedTask, SubmissionDetail } from '../types/workflow';

export const workflowApi = {
  // Get tasks assigned to current user
  getMyTasks: async (): Promise<{ tasks: Task[] }> => {
    const { data } = await api.get('/workflow/my-tasks');
    return data;
  },

  // Get submissions created by current user
  getMySubmissions: async (): Promise<{ submissions: Submission[] }> => {
    const { data } = await api.get('/workflow/my-submissions');
    return data;
  },

  // Get completed tasks (history)
  getMyHistory: async (): Promise<{ tasks: CompletedTask[] }> => {
    const { data } = await api.get('/workflow/my-history');
    return data;
  },

  // Get submission detail by ID
  getSubmissionDetail: async (id: string): Promise<SubmissionDetail> => {
    const { data } = await api.get(`/workflow/submissions/${id}`);
    return data;
  },

  // Complete an approval step (approve or reject)
  completeStep: async (
    submissionId: string,
    stepName: string,
    action: 'approve' | 'reject',
    comments?: string
  ): Promise<void> => {
    await api.post(`/workflow/submissions/${submissionId}/steps/${stepName}/complete`, {
      action,
      comments
    });
  }
};
