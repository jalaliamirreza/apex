import axios from 'axios';
import { Form, Submission, SearchResult } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'
});

export async function getForms(): Promise<Form[]> {
  const { data } = await api.get('/forms');
  return data.forms;
}

export async function getForm(slug: string): Promise<Form> {
  const { data } = await api.get(`/forms/${slug}`);
  return data;
}

export async function submitForm(slug: string, formData: Record<string, any>): Promise<Submission> {
  const { data } = await api.post(`/forms/${slug}/submissions`, { data: formData });
  return data;
}

export async function getSubmissions(slug: string): Promise<{ submissions: Submission[]; total: number }> {
  const { data } = await api.get(`/forms/${slug}/submissions`);
  return data;
}

export async function search(query: string): Promise<{ results: SearchResult[]; total: number }> {
  const { data } = await api.get('/search', { params: { q: query } });
  return data;
}

export default api;
