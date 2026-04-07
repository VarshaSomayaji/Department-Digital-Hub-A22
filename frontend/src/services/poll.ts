// services/poll.ts

import API from './api';
import { Poll, CreatePollData, UpdatePollData } from '../types/poll';

export const getPolls = async (page = 1, limit = 10, active?: boolean) => {
  const params: any = { page, limit };
  if (active !== undefined) params.active = active;
  const response = await API.get('/polls', { params });
  return response.data; // { polls, pagination }
};

export const getPollById = async (id: string) => {
  const response = await API.get<Poll>(`/polls/${id}`);
  return response.data;
};

export const createPoll = async (data: CreatePollData) => {
  const response = await API.post<Poll>('/polls', data);
  return response.data;
};

export const updatePoll = async (id: string, data: UpdatePollData) => {
  const response = await API.patch<Poll>(`/polls/${id}`, data);
  return response.data;
};

export const deletePoll = async (id: string) => {
  await API.delete(`/polls/${id}`);
  // usually no need to return data
};

export const respondPoll = async (id: string, selectedOption: string) => {
  const response = await API.post(`/polls/${id}/respond`, { selectedOption });
  return response.data;
};

// Alias for compatibility if you already used votePoll in many places
export const votePoll = respondPoll;   // ← recommended: keep votePoll name

export const getPollResults = async (id: string) => {
  const response = await API.get(`/polls/${id}/results`);
  return response.data;
};