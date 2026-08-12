import api from './axios';

export const getAnimals = (farmId, params) => api.get(`/farm/animals/farm/${farmId}`, { params });
export const getAnimal = (id) => api.get(`/farm/animals/${id}`);
export const addAnimal = (farmId, data) => api.post(`/farm/animals/farm/${farmId}`, data);
export const updateAnimal = (id, data) => api.put(`/farm/animals/${id}`, data);
export const updateAnimalStatus = (id, status) => api.put(`/farm/animals/${id}/status`, { status });
export const recordMortality = (id, count) => api.put(`/farm/animals/${id}/mortality`, { count });
export const deleteAnimal = (id) => api.delete(`/farm/animals/${id}`);