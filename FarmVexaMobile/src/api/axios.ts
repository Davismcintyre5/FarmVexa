import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://farmvexaserver.pxxl.click/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Silently fail
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data?.data;

    if (status === 402) {
      if (data?.token) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
      }
    }

    if (status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export default api;
export const API_URL_FOR_SOCKET = 'https://farmvexaserver.pxxl.click';

// Public endpoints
export const publicApi = {
  getPublicSettings: () => api.get('/admin/public/settings'),
  getPublicMarketStatus: () => api.get('/public/market/status'),
  getPublicProducts: (params?: any) => api.get('/public/market/products', { params }),
  getPublicProduct: (id: string) => api.get(`/public/market/products/${id}`),
  sendInquiry: (id: string, data: any) => api.post(`/public/market/products/${id}/inquire`, data),
  getLegal: (type: string) => api.get(`/public/legal/${type}`),
};

// Auth endpoints
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/farm/auth/login', data),
  register: (data: any) => api.post('/farm/auth/register', data),
  getProfile: () => api.get('/farm/auth/profile'),
  updateProfile: (data: any) => api.put('/farm/auth/profile', data),
  changePassword: (data: any) => api.put('/farm/auth/change-password', data),
  forgotPassword: (email: string) => api.post('/farm/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/farm/auth/reset-password', data),
};

// Farm endpoints
export const farmApi = {
  getFarms: () => api.get('/farm/farms'),
  getFarm: (id: string) => api.get(`/farm/farms/${id}`),
  createFarm: (data: any) => api.post('/farm/farms', data),
  updateFarm: (id: string, data: any) => api.put(`/farm/farms/${id}`, data),
  deleteFarm: (id: string) => api.delete(`/farm/farms/${id}`),
};

// Field endpoints
export const fieldApi = {
  getFields: (farmId: string) => api.get(`/farm/fields/farm/${farmId}`),
  getField: (id: string) => api.get(`/farm/fields/${id}`),
  createField: (farmId: string, data: any) => api.post(`/farm/fields/farm/${farmId}`, data),
  updateField: (id: string, data: any) => api.put(`/farm/fields/${id}`, data),
  deleteField: (id: string) => api.delete(`/farm/fields/${id}`),
};

// Device endpoints
export const deviceApi = {
  getDevices: (farmId: string) => api.get(`/farm/devices/farm/${farmId}`),
  getDevice: (id: string) => api.get(`/farm/devices/${id}`),
  registerDevice: (farmId: string, data: any) => api.post(`/farm/devices/farm/${farmId}`, data),
  updateDevice: (id: string, data: any) => api.put(`/farm/devices/${id}`, data),
  deleteDevice: (id: string) => api.delete(`/farm/devices/${id}`),
};

// Animal endpoints
export const animalApi = {
  getAnimals: (farmId: string) => api.get(`/farm/animals/farm/${farmId}`),
  getAnimal: (id: string) => api.get(`/farm/animals/${id}`),
  addAnimal: (farmId: string, data: any) => api.post(`/farm/animals/farm/${farmId}`, data),
  updateAnimal: (id: string, data: any) => api.put(`/farm/animals/${id}`, data),
  deleteAnimal: (id: string) => api.delete(`/farm/animals/${id}`),
};

// Health endpoints
export const healthApi = {
  getHealthRecords: (farmId: string) => api.get(`/farm/health/farm/${farmId}`),
  addHealthRecord: (farmId: string, data: any) => api.post(`/farm/health/farm/${farmId}`, data),
  updateHealthRecord: (id: string, data: any) => api.put(`/farm/health/${id}`, data),
  deleteHealthRecord: (id: string) => api.delete(`/farm/health/${id}`),
};

// Production endpoints
export const productionApi = {
  getProduction: (farmId: string) => api.get(`/farm/production/farm/${farmId}`),
  addProduction: (farmId: string, data: any) => api.post(`/farm/production/farm/${farmId}`, data),
  deleteProduction: (id: string) => api.delete(`/farm/production/${id}`),
};

// Stock endpoints
export const stockApi = {
  getStock: (farmId: string) => api.get(`/farm/stock/farm/${farmId}`),
  getStockItem: (id: string) => api.get(`/farm/stock/${id}`),
  getStockMovements: (id: string) => api.get(`/farm/stock/${id}/movements`),
  stockIn: (farmId: string, data: any) => api.post(`/farm/stock/farm/${farmId}/in`, data),
  stockOut: (farmId: string, data: any) => api.post(`/farm/stock/farm/${farmId}/out`, data),
  updateStock: (id: string, data: any) => api.put(`/farm/stock/${id}`, data),
  deleteStock: (id: string) => api.delete(`/farm/stock/${id}`),
};

// Inventory endpoints
export const inventoryApi = {
  getInventory: (farmId: string) => api.get(`/farm/inventory/farm/${farmId}`),
  addItem: (farmId: string, data: any) => api.post(`/farm/inventory/farm/${farmId}`, data),
  updateItem: (id: string, data: any) => api.put(`/farm/inventory/${id}`, data),
  deleteItem: (id: string) => api.delete(`/farm/inventory/${id}`),
  stockIn: (farmId: string, data: any) => api.post(`/farm/stock/farm/${farmId}/in`, data),
  stockOut: (farmId: string, data: any) => api.post(`/farm/stock/farm/${farmId}/out`, data),
};

// Equipment endpoints
export const equipmentApi = {
  getEquipment: (farmId: string) => api.get(`/farm/equipment/farm/${farmId}`),
  addEquipment: (farmId: string, data: any) => api.post(`/farm/equipment/farm/${farmId}`, data),
  updateEquipment: (id: string, data: any) => api.put(`/farm/equipment/${id}`, data),
  deleteEquipment: (id: string) => api.delete(`/farm/equipment/${id}`),
};

// Finance endpoints
export const financeApi = {
  getTransactions: (farmId: string, params?: any) => api.get(`/farm/transactions/farm/${farmId}`, { params }),
  addTransaction: (farmId: string, data: any) => api.post(`/farm/transactions/farm/${farmId}`, data),
  deleteTransaction: (id: string) => api.delete(`/farm/transactions/${id}`),
  getSummary: (farmId: string, period?: string) => api.get(`/farm/transactions/farm/${farmId}/summary`, { params: { period } }),
};

// Price endpoints
export const priceApi = {
  getPrices: (farmId: string) => api.get(`/farm/prices/farm/${farmId}`),
  getPrice: (id: string) => api.get(`/farm/prices/${id}`),
  setPrice: (farmId: string, data: any) => api.post(`/farm/prices/farm/${farmId}`, data),
  updatePrice: (id: string, data: any) => api.put(`/farm/prices/${id}`, data),
  deletePrice: (id: string) => api.delete(`/farm/prices/${id}`),
  getSuggestedProducts: (farmId: string) => api.get(`/farm/prices/farm/${farmId}/suggested`),
};

// Team endpoints
export const teamApi = {
  getTeam: (farmId: string) => api.get(`/farm/team/farm/${farmId}`),
  addMember: (farmId: string, data: any) => api.post(`/farm/team/farm/${farmId}`, data),
  updateMember: (id: string, data: any) => api.put(`/farm/team/${id}`, data),
  deleteMember: (id: string) => api.delete(`/farm/team/${id}`),
  toggleMember: (id: string) => api.put(`/farm/team/${id}/toggle`),
};

// Task endpoints
export const taskApi = {
  getTasks: (farmId: string) => api.get(`/farm/tasks/farm/${farmId}`),
  createTask: (farmId: string, data: any) => api.post(`/farm/tasks/farm/${farmId}`, data),
  updateTask: (id: string, data: any) => api.put(`/farm/tasks/${id}`, data),
  updateTaskStatus: (id: string, status: string) => api.put(`/farm/tasks/${id}/status`, { status }),
  deleteTask: (id: string) => api.delete(`/farm/tasks/${id}`),
};

// Market endpoints
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

// Alerts endpoints
export const alertApi = {
  getAlerts: (farmId: string) => api.get(`/farm/alerts/farm/${farmId}`),
  markRead: (id: string) => api.put(`/farm/alerts/${id}/read`),
};

// Weather endpoints
export const weatherApi = {
  getFarmWeather: (farmId: string) => api.get(`/farm/weather/farm/${farmId}`),
  refreshWeather: (farmId: string) => api.post(`/farm/weather/farm/${farmId}/refresh`),
};

// Sensor endpoints
export const sensorApi = {
  getFieldReadings: (fieldId: string, limit = 50) => api.get(`/farm/sensors/field/${fieldId}?limit=${limit}`),
  getDeviceReadings: (deviceId: string, limit = 50) => api.get(`/farm/sensors/device/${deviceId}?limit=${limit}`),
};

// Chat endpoints
export const chatApi = {
  getChats: () => api.get('/farm/chat'),
  getChat: (id: string) => api.get(`/farm/chat/${id}`),
  startChat: (data: any) => api.post('/farm/chat', data),
  sendMessage: (id: string, message: string) => api.post(`/farm/chat/${id}/message`, { message }),
  deleteChat: (id: string) => api.delete(`/farm/chat/${id}`),
  clearChats: () => api.delete('/farm/chat/clear'),
};

// Image endpoints
export const imageApi = {
  uploadImage: (formData: FormData) => api.post('/farm/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getFieldImages: (fieldId: string) => api.get(`/farm/images/field/${fieldId}`),
  deleteImage: (id: string) => api.delete(`/farm/images/${id}`),
};

// Plan endpoints
export const planApi = {
  getPlans: () => api.get('/farm/plans'),
  submitUpgrade: (data: any) => api.post('/farm/plans/upgrade', data),
};

// Renewal endpoints
export const renewalApi = {
  getSubscription: () => api.get('/farm/renewal/subscription'),
  submitRenewal: (data: any) => api.post('/farm/renewal/submit', data),
};

// Report endpoints
export const reportApi = {
  getReport: (farmId: string, params?: any) => api.get(`/farm/reports/farm/${farmId}`, { params }),
};