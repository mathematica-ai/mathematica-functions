import apiClient from './api';
import type { Organisation, OrganisationCreate, OrganisationUpdate } from '@/types/organisation';

export const apiService = {
  // Organisation endpoints
  organisations: {
    create: (data: OrganisationCreate) => 
      apiClient.post<Organisation>('/api/organisations', data),
    getAll: () => 
      apiClient.get<Organisation[]>('/api/organisations'),
    get: (id: string) => 
      apiClient.get<Organisation>(`/api/organisations?id=${id}`),
    update: (id: string, data: OrganisationUpdate) => 
      apiClient.put<Organisation>(`/api/organisations?id=${id}`, data),
    delete: (id: string) => 
      apiClient.delete(`/api/organisations?id=${id}`),
  },
  
  // Users endpoints
  users: {
    create: (data: any) => apiClient.post('/api/users', data),
    get: (id: string) => apiClient.get(`/api/users?id=${id}`),
    update: (id: string, data: any) => apiClient.put(`/api/users?id=${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/users?id=${id}`),
  },

  // Projects endpoints
  projects: {
    create: (data: any) => apiClient.post('/api/projects', data),
    get: (id: string) => apiClient.get(`/api/projects?id=${id}`),
    update: (id: string, data: any) => apiClient.put(`/api/projects?id=${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/projects?id=${id}`),
  }
}; 