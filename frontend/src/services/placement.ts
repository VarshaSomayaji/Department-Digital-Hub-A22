import API from './api';
import { PlacementDrive, CreatePlacementData, UpdatePlacementData } from '../types/placement';

export const getPlacementDrives = async () => {
  const response = await API.get<PlacementDrive[]>('/placements');
  return response.data;
};

export const getPlacementDriveById = async (id: string) => {
  const response = await API.get<PlacementDrive>(`/placements/${id}`);
  return response.data;
};

export const createPlacementDrive = async (formData: FormData) => {
  const response = await API.post<PlacementDrive>('/placements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updatePlacementDrive = async (id: string, data: UpdatePlacementData) => {
  const response = await API.patch<PlacementDrive>(`/placements/${id}`, data);
  return response.data;
};

export const deletePlacementDrive = async (id: string) => {
  const response = await API.delete(`/placements/${id}`);
  return response.data;
};