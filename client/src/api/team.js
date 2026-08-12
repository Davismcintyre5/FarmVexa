import api from './axios';

export const getTeam = (farmId) => api.get(`/farm/team/farm/${farmId}`);
export const getTeamMember = (id) => api.get(`/farm/team/${id}`);
export const addTeamMember = (farmId, data) => api.post(`/farm/team/farm/${farmId}`, data);
export const updateTeamMember = (id, data) => api.put(`/farm/team/${id}`, data);
export const toggleTeamMember = (id) => api.put(`/farm/team/${id}/toggle`);
export const deleteTeamMember = (id) => api.delete(`/farm/team/${id}`);