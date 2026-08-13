import api from './axios';

export const getPublicSettings = () => api.get('/admin/public/settings');
export const getChatbotSettings = () => api.get('/admin/public/chatbot');
export const sendChatbotMessage = (message) => api.post('/public/chatbot/chat', { message });
export const checkAdminExists = () => api.get('/admin/public/check-admin');
export const createFirstAdmin = (data) => api.post('/admin/public/setup', data);