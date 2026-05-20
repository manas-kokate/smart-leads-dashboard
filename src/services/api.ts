import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginApi = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const registerApi = (name: string, email: string, password: string, role: 'admin' | 'sales' = 'sales') =>
  api.post('/auth/register', { name, email, password, role });

// Leads
export interface LeadFilters {
  status?: string;
  source?: string;
  search?: string;
  sort?: string;
  page?: number;
}

export const getLeadsApi = (filters: LeadFilters = {}) => {
  const params: Record<string, string | number> = {};
  if (filters.status) params.status = filters.status;
  if (filters.source) params.source = filters.source;
  if (filters.search) params.search = filters.search;
  if (filters.sort) params.sort = filters.sort;
  if (filters.page) params.page = filters.page;
  return api.get('/leads', { params });
};

export const getLeadByIdApi = (id: string) => api.get(`/leads/${id}`);

export const createLeadApi = (data: object) => api.post('/leads', data);

export const updateLeadApi = (id: string, data: object) => api.put(`/leads/${id}`, data);

export const deleteLeadApi = (id: string) => api.delete(`/leads/${id}`);

export default api;
