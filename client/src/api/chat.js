import api from './axios';

export const getChats = () => api.get('/farm/chat');
export const getChat = (id) => api.get(`/farm/chat/${id}`);
export const startChat = (data) => api.post('/farm/chat', data);
export const sendMessage = (id, message) => api.post(`/farm/chat/${id}/message`, { message });
export const updateChatTitle = (id, title) => api.put(`/farm/chat/${id}/title`, { title });
export const deleteChat = (id) => api.delete(`/farm/chat/${id}`);
export const clearChats = () => api.delete('/farm/chat/clear');