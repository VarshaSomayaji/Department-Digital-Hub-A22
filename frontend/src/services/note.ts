import API from './api';
import { Note } from '../types/note';

export const getNotes = async (filters?: { batch?: string; subject?: string }) => {
  const response = await API.get<Note[]>('/notes', { params: filters });
  return response.data;
};

export const getNoteById = async (id: string) => {
  const response = await API.get<Note>(`/notes/${id}`);
  return response.data;
};

export const createNote = async (formData: FormData) => {
  const response = await API.post<Note>('/notes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteNote = async (id: string) => {
  const response = await API.delete(`/notes/${id}`);
  return response.data;
};