import API from './api';
import { Timetable, CreateTimetableData, UpdateTimetableData } from '../types/timetable';

export const getTimetables = async (filters?: { batch?: string; day?: string }) => {
  const response = await API.get<Timetable[]>('/timetable', { params: filters });
  return response.data;
};

export const getTimetableById = async (id: string) => {
  const response = await API.get<Timetable>(`/timetable/${id}`);
  return response.data;
};

export const createTimetable = async (data: CreateTimetableData) => {
  const response = await API.post<Timetable>('/timetable', data);
  return response.data;
};

export const updateTimetable = async (id: string, data: UpdateTimetableData) => {
  const response = await API.patch<Timetable>(`/timetable/${id}`, data);
  return response.data;
};

export const deleteTimetable = async (id: string) => {
  const response = await API.delete(`/timetable/${id}`);
  return response.data;
};