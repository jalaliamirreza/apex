import api from './api';

// Types matching backend snake_case (as returned from API)
export interface Space {
  id: string;
  name: string;
  name_fa: string;
  slug: string;
  icon: string;
  color: string;
  order_index: number;
  direction: 'ltr' | 'rtl';
  is_active: boolean;
}

export interface Page {
  id: string;
  space_id: string;
  name: string;
  name_fa: string;
  slug: string;
  icon: string;
  order_index: number;
  is_default: boolean;
  is_active: boolean;
}

export interface Section {
  id: string;
  page_id: string;
  name: string;
  name_fa: string;
  order_index: number;
  is_active: boolean;
}

export interface Tile {
  id: string;
  section_id: string;
  name: string;
  name_fa: string;
  description?: string;
  icon: string;
  color: string;
  slug: string;
  type: 'form' | 'link' | 'kpi' | 'app';
  order_index: number;
  direction?: 'ltr' | 'rtl';
  config?: Record<string, any>;
  form_id?: string | null;
  is_active: boolean;
  // Joined fields from forms table
  form_name?: string;
  form_slug?: string;
}

export interface Form {
  id: string;
  name: string;
  name_fa: string;
  slug: string;
  description: string | null;
  status: string;
  icon: string;
  color: string;
  schema?: object;
  created_at?: string;
  updated_at?: string;
}

// Create DTOs
export type CreateSpaceDto = Omit<Space, 'id'>;
export type UpdateSpaceDto = Partial<Omit<Space, 'id'>>;
export type CreatePageDto = Omit<Page, 'id'>;
export type UpdatePageDto = Partial<Omit<Page, 'id'>>;
export type CreateSectionDto = Omit<Section, 'id'>;
export type UpdateSectionDto = Partial<Omit<Section, 'id'>>;
export type CreateTileDto = Omit<Tile, 'id' | 'form_name' | 'form_slug'>;
export type UpdateTileDto = Partial<Omit<Tile, 'id' | 'form_name' | 'form_slug'>>;
export type CreateFormDto = Omit<Form, 'id' | 'created_at' | 'updated_at'>;
export type UpdateFormDto = Partial<Omit<Form, 'id' | 'created_at' | 'updated_at'>>;

// ==================== SPACES ====================
export const spacesApi = {
  getAll: () => api.get('/admin/spaces').then(r => r.data.spaces as Space[]),
  getById: (id: string) => api.get(`/admin/spaces/${id}`).then(r => r.data as Space),
  create: (data: CreateSpaceDto) => api.post('/admin/spaces', data).then(r => r.data as Space),
  update: (id: string, data: UpdateSpaceDto) => api.put(`/admin/spaces/${id}`, data).then(r => r.data as Space),
  delete: (id: string) => api.delete(`/admin/spaces/${id}`)
};

// ==================== PAGES ====================
export const pagesApi = {
  getAll: (spaceId?: string) => {
    const params = spaceId ? { spaceId } : {};
    return api.get('/admin/pages', { params }).then(r => r.data.pages as Page[]);
  },
  getById: (id: string) => api.get(`/admin/pages/${id}`).then(r => r.data as Page),
  create: (data: CreatePageDto) => api.post('/admin/pages', data).then(r => r.data as Page),
  update: (id: string, data: UpdatePageDto) => api.put(`/admin/pages/${id}`, data).then(r => r.data as Page),
  delete: (id: string) => api.delete(`/admin/pages/${id}`)
};

// ==================== SECTIONS ====================
export const sectionsApi = {
  getAll: (pageId?: string) => {
    const params = pageId ? { pageId } : {};
    return api.get('/admin/sections', { params }).then(r => r.data.sections as Section[]);
  },
  getById: (id: string) => api.get(`/admin/sections/${id}`).then(r => r.data as Section),
  create: (data: CreateSectionDto) => api.post('/admin/sections', data).then(r => r.data as Section),
  update: (id: string, data: UpdateSectionDto) => api.put(`/admin/sections/${id}`, data).then(r => r.data as Section),
  delete: (id: string) => api.delete(`/admin/sections/${id}`)
};

// ==================== TILES ====================
export const tilesApi = {
  getAll: (sectionId?: string) => {
    const params = sectionId ? { sectionId } : {};
    return api.get('/admin/tiles', { params }).then(r => r.data.tiles as Tile[]);
  },
  getById: (id: string) => api.get(`/admin/tiles/${id}`).then(r => r.data as Tile),
  create: (data: CreateTileDto) => api.post('/admin/tiles', data).then(r => r.data as Tile),
  update: (id: string, data: UpdateTileDto) => api.put(`/admin/tiles/${id}`, data).then(r => r.data as Tile),
  delete: (id: string) => api.delete(`/admin/tiles/${id}`)
};

// ==================== FORMS ====================
export const formsApi = {
  getAll: () => api.get('/admin/forms').then(r => r.data.forms as Form[]),
  getById: (id: string) => api.get(`/admin/forms/${id}`).then(r => r.data as Form),
  create: (data: CreateFormDto) => api.post('/admin/forms', data).then(r => r.data as Form),
  update: (id: string, data: UpdateFormDto) => api.put(`/admin/forms/${id}`, data).then(r => r.data as Form),
  delete: (id: string) => api.delete(`/admin/forms/${id}`)
};
