import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://farmvexaserver.pxxl.click/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export const login = (data: any) => api.post('/farm/auth/login', data);
export const register = (data: any) => api.post('/farm/auth/register', data);
export const getProfile = () => api.get('/farm/auth/profile');
export const updateProfile = (data: any) => api.put('/farm/auth/profile', data);
export const changePassword = (data: any) => api.put('/farm/auth/change-password', data);
export const forgotPassword = (email: string) => api.post('/farm/auth/forgot-password', { email });
export const resetPassword = (data: any) => api.post('/farm/auth/reset-password', data);

export const getFarms = () => api.get('/farm/farms');
export const getFarm = (id: string) => api.get(`/farm/farms/${id}`);
export const createFarm = (data: any) => api.post('/farm/farms', data);
export const updateFarm = (id: string, data: any) => api.put(`/farm/farms/${id}`, data);
export const deleteFarm = (id: string) => api.delete(`/farm/farms/${id}`);

export const getFields = (farmId: string) => api.get(`/farm/fields/farm/${farmId}`);
export const getField = (id: string) => api.get(`/farm/fields/${id}`);
export const createField = (farmId: string, data: any) => api.post(`/farm/fields/farm/${farmId}`, data);
export const updateField = (id: string, data: any) => api.put(`/farm/fields/${id}`, data);
export const deleteField = (id: string) => api.delete(`/farm/fields/${id}`);

export const getDevices = (farmId: string) => api.get(`/farm/devices/farm/${farmId}`);
export const getDevice = (id: string) => api.get(`/farm/devices/${id}`);
export const registerDevice = (farmId: string, data: any) => api.post(`/farm/devices/farm/${farmId}`, data);
export const updateDevice = (id: string, data: any) => api.put(`/farm/devices/${id}`, data);
export const deleteDevice = (id: string) => api.delete(`/farm/devices/${id}`);

export const getFieldReadings = (fieldId: string, limit = 50) => api.get(`/farm/sensors/field/${fieldId}?limit=${limit}`);
export const getDeviceReadings = (deviceId: string, limit = 50) => api.get(`/farm/sensors/device/${deviceId}?limit=${limit}`);

export const getFarmWeather = (farmId: string) => api.get(`/farm/weather/farm/${farmId}`);
export const refreshWeather = (farmId: string) => api.post(`/farm/weather/farm/${farmId}/refresh`);

export const getFarmAlerts = (farmId: string) => api.get(`/farm/alerts/farm/${farmId}`);
export const markAlertRead = (id: string) => api.put(`/farm/alerts/${id}/read`);
export const deleteAlert = (id: string) => api.delete(`/farm/alerts/${id}`);
export const deleteAllAlerts = (farmId: string) => api.delete(`/farm/alerts/farm/${farmId}/all`);

export const getChats = () => api.get('/farm/chat');
export const getChat = (id: string) => api.get(`/farm/chat/${id}`);
export const startChat = (data: any) => api.post('/farm/chat', data);
export const sendMessage = (id: string, message: string) => api.post(`/farm/chat/${id}/message`, { message });
export const updateChatTitle = (id: string, title: string) => api.put(`/farm/chat/${id}/title`, { title });
export const deleteChat = (id: string) => api.delete(`/farm/chat/${id}`);
export const clearChats = () => api.delete('/farm/chat/clear');

export const uploadImage = (formData: FormData) => api.post('/farm/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const getFieldImages = (fieldId: string) => api.get(`/farm/images/field/${fieldId}`);
export const getImage = (id: string) => api.get(`/farm/images/${id}`);

export const getAnimals = (farmId: string) => api.get(`/farm/animals/farm/${farmId}`);
export const getStock = (farmId: string) => api.get(`/farm/stock/farm/${farmId}`);
export const getPublicSettings = () => api.get('/admin/public/settings');

export default api;