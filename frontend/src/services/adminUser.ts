import API from './api';
import { User, CreateUserData, UpdateUserData, UserStats } from '../types/user';
import { GrowthStat } from '../types/dashboard';



// Get all users with optional filters
export const getUsers = async (params?: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await API.get<{ users: User[]; pagination: any }>('/auth/users', { params });
  return response.data;
};

// Get a single user by ID
export const getUserById = async (id: string) => {
  const response = await API.get<User>(`/auth/users/${id}`);
  return response.data;
};

// Create a new user (any role)
export const createUser = async (formData: FormData) => {
  const response = await API.post<User>('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Update an existing user (admin only)
export const updateUser = async (id: string, role: string, formData: FormData) => {
  // Assuming backend has PATCH /users/:id?role=...
  const response = await API.patch<User>(`/auth/users/${id}?role=${role}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Delete a user
export const deleteUser = async (id: string, role: string) => {
  const response = await API.delete(`/auth/users/${id}?role=${role}`);
  return response.data;
};

// Optional: get dropdown list of users by role (for select inputs)
export const getUsersDropdown = async (role: string, search?: string) => {
  const response = await API.get('/auth/dropdown', { params: { role, q: search } });
  return response.data;
};

export const getUserStats = async (): Promise<UserStats> => {
  const response = await API.get('/admin/stats/users');
  return response.data;
};

export const getUserGrowth = async (months: number = 6): Promise<GrowthStat[]> => {
  const response = await API.get('/admin/stats/growth', { params: { months } });
  return response.data;
};