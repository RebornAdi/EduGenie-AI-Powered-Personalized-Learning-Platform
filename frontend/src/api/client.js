import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: API_BASE });

export const getApiError = (error, fallback = 'Something went wrong.') => (
  error?.response?.data?.detail || error?.message || fallback
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const materialsAPI = {
  createSubject: (name) => api.post('/materials/subjects', { name }),
  listSubjects: () => api.get('/materials/subjects'),
  uploadNote: (formData) => api.post('/materials/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  listNotes: (subjectId) => api.get('/materials/notes', { params: { subject_id: subjectId } }),
};

export const tutorAPI = {
  chat: (message, subjectId) => api.post('/tutor/chat', { message, subject_id: subjectId }),
};

export const quizAPI = {
  generate: (data) => api.post('/quiz/generate', data),
  submit: (quizId, answers) => api.post(`/quiz/${quizId}/submit`, { answers }),
  history: () => api.get('/quiz/history'),
};

export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
  weakTopics: () => api.get('/analytics/weak-topics'),
  prediction: () => api.get('/analytics/prediction'),
};

export const plannerAPI = {
  listPlans: () => api.get('/planner/plans'),
  createPlan: (data) => api.post('/planner/plans', data),
  generate: (data) => api.post('/planner/generate', data),
  complete: (planId) => api.patch(`/planner/plans/${planId}/complete`),
};

export default api;
