import API from './api';
import { Quiz, CreateQuizData, UpdateQuizData, QuizSubmission, QuizResult } from '../types/quiz';

// Get all quizzes (with filters)
export const getQuizzes = async (filters?: { subject?: string; batch?: string }) => {
  const response = await API.get<Quiz[]>('/quizzes', { params: filters });
  return response.data;
};

// Get a single quiz by ID (faculty view – includes correct answers)
export const getQuizById = async (id: string) => {
  const response = await API.get<Quiz>(`/quizzes/${id}`);
  return response.data;
};

// Get quiz for taking (student view – no correct answers)
export const getQuizForTaking = async (id: string) => {
  const response = await API.get<Quiz>(`/quizzes/${id}/take`);
  return response.data;
};

// Create a quiz (faculty only)
export const createQuiz = async (data: CreateQuizData) => {
  const response = await API.post<Quiz>('/quizzes', data);
  return response.data;
};

// Update a quiz (faculty only)
export const updateQuiz = async (id: string, data: UpdateQuizData) => {
  const response = await API.patch<Quiz>(`/quizzes/${id}`, data);
  return response.data;
};

// Delete a quiz (faculty only)
export const deleteQuiz = async (id: string) => {
  const response = await API.delete(`/quizzes/${id}`);
  return response.data;
};

// Submit quiz answers (student)
export const submitQuiz = async (id: string, answers: QuizSubmission['answers']) => {
  const response = await API.post<QuizResult>(`/quizzes/${id}/submit`, { answers });
  return response.data;
};

// Get quiz results (student view own result, faculty view all)
export const getQuizResults = async (id: string) => {
  const response = await API.get(`/quizzes/${id}/results`);
  return response.data;
};

export const getUpcomingQuizCount = async (): Promise<number> => {
  const response = await API.get('/quizzes/upcoming/count');
  return response.data.count;
};

export const getUpcomingQuizzes = async (limit: number = 5) => {
  const response = await API.get('/quizzes/upcoming', { params: { limit } });
  return response.data;
};