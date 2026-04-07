import API from './api';
import { Marks, CreateMarksData, UpdateMarksData } from '../types/marks';

// Get all marks entries (with filters)
export const getMarks = async (filters?: { batch?: string; subject?: string; examName?: string }) => {
  const response = await API.get<Marks[]>('/marks', { params: filters });
  return response.data;
};

// Get a single marks entry by ID
export const getMarksById = async (id: string) => {
  const response = await API.get<Marks>(`/marks/${id}`);
  return response.data;
};

// Create marks entry (faculty)
export const createMarks = async (data: CreateMarksData) => {
  const response = await API.post<Marks>('/marks', data);
  return response.data;
};

// Update marks entry (faculty)
export const updateMarks = async (id: string, data: UpdateMarksData) => {
  const response = await API.patch<Marks>(`/marks/${id}`, data);
  return response.data;
};

// Delete marks entry (faculty)
export const deleteMarks = async (id: string) => {
  const response = await API.delete(`/marks/${id}`);
  return response.data;
};

// For students: get marks for a specific student (can use getMarks with batch and then filter client-side)
export const getStudentMarks = async (batch: string, studentId: string) => {
  const response = await API.get<Marks[]>('/marks', { params: { batch } });
  // Filter marksObtained for this student
  const filtered = response.data.map(entry => ({
    ...entry,
    marksObtained: entry.marksObtained.filter(m => m.student._id === studentId)
  })).filter(entry => entry.marksObtained.length > 0);
  return filtered;
};