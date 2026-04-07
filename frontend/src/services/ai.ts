import API from './api';
import { DoubtRequest, DoubtResponse, SummarizeRequest, SummarizeResponse } from '../types/ai';

export const askDoubt = async (question: string, context?: string) => {
  const response = await API.post<DoubtResponse>('/ai/doubt', { question, context });
  return response.data.answer;
};

export const summarizeText = async (text: string) => {
  const response = await API.post<SummarizeResponse>('/ai/summarize', { text });
  return response.data.summary;
};