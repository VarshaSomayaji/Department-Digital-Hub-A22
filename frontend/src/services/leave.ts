import API from './api';
import { LeaveRequest, CreateLeaveData, UpdateLeaveData, ApproveLeaveData } from '../types/leave';

// For students/faculty: get own leave requests
export const getMyLeaveRequests = async () => {
  const response = await API.get<LeaveRequest[]>('/leave/me');
  return response.data;
};

// For HOD/Faculty: get pending leave requests (for their approval)
export const getPendingLeaveRequests = async () => {
  const response = await API.get<LeaveRequest[]>('/leave/', { params: { status: 'PENDING' } });
  return response.data;
};

// Get all leave requests (admin maybe)
export const getAllLeaveRequests = async () => {
  const response = await API.get<LeaveRequest[]>('/leave');
  return response.data;
};

export const getLeaveRequestById = async (id: string) => {
  const response = await API.get<LeaveRequest>(`/leave/${id}`);
  return response.data;
};

export const createLeaveRequest = async (data: CreateLeaveData) => {
  const response = await API.post<LeaveRequest>('/leave', data);
  return response.data;
};

export const updateLeaveRequest = async (id: string, data: UpdateLeaveData) => {
  const response = await API.patch<LeaveRequest>(`/leave/${id}`, data);
  return response.data;
};

// Approve/reject
export const approveLeaveRequest = async (id: string, data: ApproveLeaveData) => {
  const response = await API.patch<LeaveRequest>(`/leave/${id}/status`, data);
  return response.data;
};

export const deleteLeaveRequest = async (id: string) => {
  const response = await API.delete(`/leave/${id}`);
  return response.data;
};

export const getPendingLeaveCount = async (): Promise<number> => {
  const response = await API.get('/leave/count/pending');
  return response.data.count;
};