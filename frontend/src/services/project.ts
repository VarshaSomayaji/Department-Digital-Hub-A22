import API from './api';
import { Project, CreateProjectData, UpdateProjectData } from '../types/project';
import { DomainStat, YearStat } from '../types/dashboard';

export const getProjects = async (filters?: { domain?: string; year?: number; search?: string }) => {
  const response = await API.get<Project[]>('/projects', { params: filters });
  return response.data;
};

export const getProjectById = async (id: string) => {
  const response = await API.get<Project>(`/projects/${id}`);
  return response.data;
};

export const createProject = async (formData: FormData) => {
  const response = await API.post<Project>('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateProject = async (id: string, data: UpdateProjectData) => {
  const response = await API.patch<Project>(`/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id: string) => {
  const response = await API.delete(`/projects/${id}`);
  return response.data;
};

// AI metadata extraction (separate endpoint)
export const extractProjectMetadata = async (title: string, description: string) => {
  const response = await API.post('/ai/extract-project', { title, description });
  return response.data; // { domain, techStack, keywords, summary }
};

export const getProjectDomainStats = async (department?: string): Promise<DomainStat[]> => {
  const params = department ? { department } : {};
  const response = await API.get('/projects/stats/domains', { params });
  return response.data;
};

export const getProjectYearStats = async (department?: string): Promise<YearStat[]> => {
  const params = department ? { department } : {};
  const response = await API.get('/projects/stats/years', { params });
  return response.data;
};

export const getMyRecentProjects = async (limit: number = 5) => {
  const response = await API.get('/projects/my/recent', { params: { limit } });
  return response.data;
};