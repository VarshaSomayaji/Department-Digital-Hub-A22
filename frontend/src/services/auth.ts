import API from './api';
import { LoginCredentials, RegisterData, User } from '../types';

export const login = async (credentials: LoginCredentials) => {
  const response = await API.post<{ user: User; token: string; msg: string }>(
    '/auth/login',
    credentials
  );
  return response.data;
};

export const register = async (formData: FormData) => {
  const response = await API.post<{ user: User; msg: string }>(
    '/auth/register',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
};

export const getMe = async () => {
  const response = await API.get<User>('/auth/me');
  return response.data;
};

export const logout = async () => {
  // If you have a logout endpoint
  // await API.post('/auth/logout');
  // Otherwise just clear client-side state
};