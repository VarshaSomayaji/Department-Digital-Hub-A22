import API from './api';
import { Announcement, CreateAnnouncementData, UpdateAnnouncementData } from '../types/announcement';

export const getAnnouncements = async () => {
  const response = await API.get<Announcement[]>('/announcements');
  return response.data;
};

export const getAnnouncementById = async (id: string) => {
  const response = await API.get<Announcement>(`/announcements/${id}`);
  return response.data;
};

export const createAnnouncement = async (data: CreateAnnouncementData) => {
  const response = await API.post<Announcement>('/announcements', data);
  return response.data;
};

export const updateAnnouncement = async (id: string, data: UpdateAnnouncementData) => {
  const response = await API.patch<Announcement>(`/announcements/${id}`, data);
  return response.data;
};

export const deleteAnnouncement = async (id: string) => {
  const response = await API.delete(`/announcements/${id}`);
  return response.data;
};

// Mark as seen
export const markAnnouncementAsSeen = async (id: string) => {
  const response = await API.patch(`/announcements/${id}/seen`);
  return response.data;
};

