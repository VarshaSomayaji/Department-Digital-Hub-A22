import API from './api';
import { ClassroomUpdate, CreateClassroomUpdateData, UpdateClassroomUpdateData } from '../types/classroom';

export const getClassroomUpdates = async (filters?: { batch?: string }) => {
  const response = await API.get<ClassroomUpdate[]>('/classroom', { params: filters });
  return response.data;
};

export const getClassroomUpdateById = async (id: string) => {
  const response = await API.get<ClassroomUpdate>(`/classroom/${id}`);
  return response.data;
};

export const createClassroomUpdate = async (formData: FormData) => {
  const response = await API.post<ClassroomUpdate>('/classroom', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateClassroomUpdate = async (id: string, data: UpdateClassroomUpdateData) => {
  const response = await API.patch<ClassroomUpdate>(`/classroom/${id}`, data);
  return response.data;
};

export const deleteClassroomUpdate = async (id: string) => {
  const response = await API.delete(`/classroom/${id}`);
  return response.data;
};