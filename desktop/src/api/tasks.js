import api from './axios';

export const getTasks = (farmId, params) => api.get(`/farm/tasks/farm/${farmId}`, { params });
export const getTask = (id) => api.get(`/farm/tasks/${id}`);
export const createTask = (farmId, data) => api.post(`/farm/tasks/farm/${farmId}`, data);
export const updateTask = (id, data) => api.put(`/farm/tasks/${id}`, data);
export const updateTaskStatus = (id, status) => api.put(`/farm/tasks/${id}/status`, { status });
export const deleteTask = (id) => api.delete(`/farm/tasks/${id}`);