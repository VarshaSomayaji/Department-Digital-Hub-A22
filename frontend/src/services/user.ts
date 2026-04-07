import API from './api';
import { User } from '../types/user';

// Get current user (already in auth service, but we can keep for clarity)
export const getCurrentUser = async () => {
  const response = await API.get<User>('/auth/me');
  return response.data;
};

// Update profile (supports image upload)
export const updateProfile = async (formData: FormData) => {
  const response = await API.patch<User>('/auth/update-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Change password
export const changePassword = async (newPassword: string, role: string) => {
  const response = await API.post('/auth/change-password', { newPassword, role });
  return response.data;
};