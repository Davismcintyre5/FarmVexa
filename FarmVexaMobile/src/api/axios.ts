import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL
const API_URL = 'https://farmvexaserver.pxxl.click/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Helper functions with silent error handling
const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    // Silently fail - no console spam
    return null;
  }
};

const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    // Silently fail
  }
};

const setUser = async (user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    // Silently fail
  }
};

const removeTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  } catch (error) {
    // Silently fail
  }
};

// Request interceptor - Add token
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data?.data;

    if (status === 402) {
      if (data?.token) {
        await setToken(data.token);
        await setUser(data.user);
      }
    }

    if (status === 401) {
      await removeTokens();
    }

    return Promise.reject(error);
  }
);

export default api;

export const API_URL_FOR_SOCKET = 'https://farmvexaserver.pxxl.click';

// All endpoints (publicApi, authApi, etc.) remain the same...
export const publicApi = {
  getPublicSettings: () => api.get('/admin/public/settings'),
  getPublicMarketStatus: () => api.get('/public/market/status'),
  getPublicProducts: (params?: any) => api.get('/public/market/products', { params }),
  getPublicProduct: (id: string) => api.get(`/public/market/products/${id}`),
  sendInquiry: (id: string, data: any) => api.post(`/public/market/products/${id}/inquire`, data),
  getLegal: (type: string) => api.get(`/public/legal/${type}`),
};

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/farm/auth/login', data),
  register: (data: any) => api.post('/farm/auth/register', data),
  getProfile: () => api.get('/farm/auth/profile'),
  updateProfile: (data: any) => api.put('/farm/auth/profile', data),
  changePassword: (data: any) => api.put('/farm/auth/change-password', data),
  forgotPassword: (email: string) => api.post('/farm/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/farm/auth/reset-password', data),
};

export const farmApi = {
  getFarms: () => api.get('/farm/farms'),
  getFarm: (id: string) => api.get(`/farm/farms/${id}`),
  createFarm: (data: any) => api.post('/farm/farms', data),
  updateFarm: (id: string, data: any) => api.put(`/farm/farms/${id}`, data),
  deleteFarm: (id: string) => api.delete(`/farm/farms/${id}`),
};

export const fieldApi = {
  getFields: (farmId: string) => api.get(`/farm/fields/farm/${farmId}`),
  getField: (id: string) => api.get(`/farm/fields/${id}`),
  createField: (farmId: string, data: any) => api.post(`/farm/fields/farm/${farmId}`, data),
  updateField: (id: string, data: any) => api.put(`/farm/fields/${id}`, data),
  deleteField: (id: string) => api.delete(`/farm/fields/${id}`),
};

export const animalApi = {
  getAnimals: (farmId: string) => api.get(`/farm/animals/farm/${farmId}`),
  getAnimal: (id: string) => api.get(`/farm/animals/${id}`),
  addAnimal: (farmId: string, data: any) => api.post(`/farm/animals/farm/${farmId}`, data),
  updateAnimal: (id: string, data: any) => api.put(`/farm/animals/${id}`, data),
  deleteAnimal: (id: string) => api.delete(`/farm/animals/${id}`),
};

export const inventoryApi = {
  getInventory: (farmId: string) => api.get(`/farm/inventory/farm/${farmId}`),
  addItem: (farmId: string, data: any) => api.post(`/farm/inventory/farm/${farmId}`, data),
  updateItem: (id: string, data: any) => api.put(`/farm/inventory/${id}`, data),
  deleteItem: (id: string) => api.delete(`/farm/inventory/${id}`),
};

export const alertApi = {
  getAlerts: (farmId: string) => api.get(`/farm/alerts/farm/${farmId}`),
  markRead: (id: string) => api.put(`/farm/alerts/${id}/read`),
};

export const chatApi = {
  getChats: () => api.get('/farm/chat'),
  getChat: (id: string) => api.get(`/farm/chat/${id}`),
  startChat: (data: any) => api.post('/farm/chat', data),
  sendMessage: (id: string, message: string) => api.post(`/farm/chat/${id}/message`, { message }),
  deleteChat: (id: string) => api.delete(`/farm/chat/${id}`),
  clearChats: () => api.delete('/farm/chat/clear'),
};

export const planApi = {
  getPlans: () => api.get('/farm/plans'),
  submitUpgrade: (data: any) => api.post('/farm/plans/upgrade', data),
};

export const renewalApi = {
  getSubscription: () => api.get('/farm/renewal/subscription'),
  submitRenewal: (data: any) => api.post('/farm/renewal/submit', data),
};

export const marketApi = {
  getMarketStatus: () => api.get('/farm/market/status'),
  getMyProducts: (params?: any) => api.get('/farm/market/products', { params }),
  addProduct: (data: any) => api.post('/farm/market/products', data),
  updateProduct: (id: string, data: any) => api.put(`/farm/market/products/${id}`, data),
  updateProductStatus: (id: string, status: string) => api.put(`/farm/market/products/${id}/status`, { status }),
  deleteProduct: (id: string) => api.delete(`/farm/market/products/${id}`),
  getInquiries: (params?: any) => api.get('/farm/market/inquiries', { params }),
  markInquiryRead: (id: string) => api.put(`/farm/market/inquiries/${id}/read`),
  deleteInquiry: (id: string) => api.delete(`/farm/market/inquiries/${id}`),
  uploadImage: (formData: FormData) => api.post('/farm/market/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const teamApi = {
  getTeam: (farmId: string) => api.get(`/farm/team/farm/${farmId}`),
  addMember: (farmId: string, data: any) => api.post(`/farm/team/farm/${farmId}`, data),
  updateMember: (id: string, data: any) => api.put(`/farm/team/${id}`, data),
  deleteMember: (id: string) => api.delete(`/farm/team/${id}`),
  toggleMember: (id: string) => api.put(`/farm/team/${id}/toggle`),
};

export const taskApi = {
  getTasks: (farmId: string) => api.get(`/farm/tasks/farm/${farmId}`),
  createTask: (farmId: string, data: any) => api.post(`/farm/tasks/farm/${farmId}`, data),
  updateTask: (id: string, data: any) => api.put(`/farm/tasks/${id}`, data),
  updateTaskStatus: (id: string, status: string) => api.put(`/farm/tasks/${id}/status`, { status }),
  deleteTask: (id: string) => api.delete(`/farm/tasks/${id}`),
};