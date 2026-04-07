import API from './api';
import { Attendance, CreateAttendanceData, UpdateAttendanceData } from '../types/attendance';
import { AttendanceSubjectStat } from '../types/dashboard';

// For faculty: get all attendance sessions they created (with optional filters)
export const getAttendance = async (filters?: { batch?: string; subject?: string; date?: string }) => {
  const response = await API.get<Attendance[]>('/attendance', { params: filters });
  return response.data;
};

// For student: get attendance records for their batch (could filter by student ID client-side)
export const getMyAttendance = async (batch: string, studentId: string) => {
  const response = await API.get<Attendance[]>('/attendance', { params: { batch } });
  // Filter records where studentId matches
  const filtered = response.data.map(session => ({
    ...session,
    records: session.records.filter(r => r.student._id === studentId)
  })).filter(session => session.records.length > 0);
  return filtered;
};

export const getAttendanceById = async (id: string) => {
  const response = await API.get<Attendance>(`/attendance/${id}`);
  return response.data;
};

export const createAttendance = async (data: CreateAttendanceData) => {
  const response = await API.post<Attendance>('/attendance', data);
  return response.data;
};

export const updateAttendance = async (id: string, data: UpdateAttendanceData) => {
  const response = await API.patch<Attendance>(`/attendance/${id}`, data);
  return response.data;
};

export const deleteAttendance = async (id: string) => {
  const response = await API.delete(`/attendance/${id}`);
  return response.data;
};

export const getMyAttendanceStats = async (): Promise<AttendanceSubjectStat[]> => {
  const response = await API.get('/attendance/my/stats');
  return response.data;
};