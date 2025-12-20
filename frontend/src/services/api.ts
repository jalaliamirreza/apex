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

// Structured API exports for new UI5 components
export const formsApi = {
  list: () => getForms().then(forms => ({ forms })),
  get: (slug: string) => getForm(slug),
  submit: (slug: string, formData: Record<string, any>) => submitForm(slug, formData),
  getSubmissions: (slug: string) => getSubmissions(slug)
};

export const searchApi = {
  search: (query: string) => search(query)
};

export const launchpadApi = {
  getSpaces: async () => {
    const { data } = await api.get('/launchpad/spaces');
    return data;
  },

  getPageContent: async (pageId: string) => {
    const { data } = await api.get(`/launchpad/pages/${pageId}`);
    return data;
  },

  getDefaultPage: async (spaceId: string) => {
    const { data } = await api.get(`/launchpad/spaces/${spaceId}/default-page`);
    return data;
  },

  // Slug-based APIs
  getPageContentBySlug: async (spaceSlug: string, pageSlug: string) => {
    const { data } = await api.get(`/launchpad/pages/by-slug/${spaceSlug}/${pageSlug}/content`);
    return data;
  },

  getDefaultPageSlug: async (spaceSlug: string) => {
    const { data } = await api.get(`/launchpad/spaces/${spaceSlug}/default-page-slug`);
    return data;
  }
};

export default api;
