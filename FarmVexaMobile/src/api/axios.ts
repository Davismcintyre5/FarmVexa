import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = 'https://farmvexaserver.pxxl.click/api';

// Storage helper - uses SecureStore on native, AsyncStorage on web
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch {}
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch {}
  },
};

export { storage };

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
      const token = await storage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data?.data;

    if (status === 402) {
      // Subscription expired - token may be returned in 402 body
      if (data?.token) {
        await storage.setItem('token', data.token);
        await storage.setItem('user', JSON.stringify(data.user));
        if (data.invoice) {
          await storage.setItem('invoice', JSON.stringify(data.invoice));
        }
        if (data.scope) {
          await storage.setItem('scope', data.scope);
        }
      }
    }

    if (status === 401) {
      await storage.removeItem('token');
      await storage.removeItem('user');
      await storage.removeItem('invoice');
      await storage.removeItem('scope');
    }

    return Promise.reject(error);
  }
);

export default api;
export const API_URL_FOR_SOCKET = 'https://farmvexaserver.pxxl.click';

// ==================== PUBLIC ENDPOINTS ====================

export const publicApi = {
  getPublicSettings: () => api.get('/admin/public/settings'),
  getPublicMarketStatus: () => api.get('/public/market/status'),
  getPublicProducts: (params?: any) => api.get('/public/market/products', { params }),
  getPublicProduct: (id: string) => api.get(`/public/market/products/${id}`),
  sendInquiry: (id: string, data: any) => api.post(`/public/market/products/${id}/inquire`, data),
  getLegal: (type: string) => api.get(`/public/legal/${type}`),

  // NEW: Invoice + Payment endpoints
  getInvoice: (invoiceNumber: string) => api.get(`/public/payment/invoice/${invoiceNumber}`),
  payStkInvoice: (data: { invoiceNumber: string; phone: string }) =>
    api.post('/public/payment/stk-invoice', data),
  checkMpesaStatus: (checkoutRequestId: string) =>
    api.get(`/public/payment/mpesa-status/${checkoutRequestId}`),
  getPaymentMethods: (params?: { amount?: number; currency?: string; invoiceNumber?: string }) =>
    api.get('/public/payment/methods', { params }),
};

// ==================== AUTH ENDPOINTS ====================

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/farm/auth/login', data),
  register: (data: any) => api.post('/farm/auth/register', data),
  me: () => api.get('/farm/auth/me'), // NEW: Returns { user, invoice, scope }
  getProfile: () => api.get('/farm/auth/profile'), // Legacy — prefer me()
  updateProfile: (data: any) => api.put('/farm/auth/profile', data),
  changePassword: (data: any) => api.put('/farm/auth/change-password', data),
  forgotPassword: (email: string) => api.post('/farm/auth/forgot-password', { email }),
  // CHANGED: token now in URL, password in body
  resetPassword: (token: string, password: string) =>
    api.post(`/farm/auth/reset-password/${token}`, { password }),
};

// ==================== FARM ENDPOINTS ====================

export const farmApi = {
  getFarms: () => api.get('/farm/farms'),
  getFarm: (id: string) => api.get(`/farm/farms/${id}`),
  createFarm: (data: any) => api.post('/farm/farms', data),
  updateFarm: (id: string, data: any) => api.put(`/farm/farms/${id}`, data),
  deleteFarm: (id: string) => api.delete(`/farm/farms/${id}`),
};

// ==================== FIELD ENDPOINTS ====================

export const fieldApi = {
  getFields: (farmId: string) => api.get(`/farm/fields/farm/${farmId}`),
  getField: (id: string) => api.get(`/farm/fields/${id}`),
  createField: (farmId: string, data: any) => api.post(`/farm/fields/farm/${farmId}`, data),
  updateField: (id: string, data: any) => api.put(`/farm/fields/${id}`, data),
  deleteField: (id: string) => api.delete(`/farm/fields/${id}`),
};

// ==================== DEVICE ENDPOINTS ====================

export const deviceApi = {
  getDevices: (farmId: string) => api.get(`/farm/devices/farm/${farmId}`),
  getDevice: (id: string) => api.get(`/farm/devices/${id}`),
  registerDevice: (farmId: string, data: any) => api.post(`/farm/devices/farm/${farmId}`, data),
  updateDevice: (id: string, data: any) => api.put(`/farm/devices/${id}`, data),
  deleteDevice: (id: string) => api.delete(`/farm/devices/${id}`),
  getVirtualDevices: () => api.get('/farm/devices/virtual'), // Already exists per Section 3.11
};

// ==================== ANIMAL ENDPOINTS ====================

export const animalApi = {
  getAnimals: (farmId: string) => api.get(`/farm/animals/farm/${farmId}`),
  getAnimal: (id: string) => api.get(`/farm/animals/${id}`),
  addAnimal: (farmId: string, data: any) => api.post(`/farm/animals/farm/${farmId}`, data),
  updateAnimal: (id: string, data: any) => api.put(`/farm/animals/${id}`, data),
  deleteAnimal: (id: string) => api.delete(`/farm/animals/${id}`),
};

// ==================== HEALTH ENDPOINTS ====================

export const healthApi = {
  getHealthRecords: (farmId: string) => api.get(`/farm/health/farm/${farmId}`),
  addHealthRecord: (farmId: string, data: any) => api.post(`/farm/health/farm/${farmId}`, data),
  updateHealthRecord: (id: string, data: any) => api.put(`/farm/health/${id}`, data),
  deleteHealthRecord: (id: string) => api.delete(`/farm/health/${id}`),
};

// ==================== PRODUCTION ENDPOINTS ====================

export const productionApi = {
  getProduction: (farmId: string) => api.get(`/farm/production/farm/${farmId}`),
  addProduction: (farmId: string, data: any) => api.post(`/farm/production/farm/${farmId}`, data),
  deleteProduction: (id: string) => api.delete(`/farm/production/${id}`),
};

// ==================== INVENTORY ENDPOINTS ====================

export const inventoryApi = {
  getInventory: (farmId: string) => api.get(`/farm/inventory/farm/${farmId}`),
  addItem: (farmId: string, data: any) => api.post(`/farm/inventory/farm/${farmId}`, data),
  updateItem: (id: string, data: any) => api.put(`/farm/inventory/${id}`, data),
  deleteItem: (id: string) => api.delete(`/farm/inventory/${id}`),
};

// ==================== STOCK ENDPOINTS ====================

export const stockApi = {
  getStock: (farmId: string) => api.get(`/farm/stock/farm/${farmId}`),
  getStockItem: (id: string) => api.get(`/farm/stock/${id}`),
  getStockMovements: (id: string) => api.get(`/farm/stock/${id}/movements`),
  stockIn: (farmId: string, data: any) => api.post(`/farm/stock/farm/${farmId}/in`, data),
  stockOut: (farmId: string, data: any) => api.post(`/farm/stock/farm/${farmId}/out`, data),
  updateStock: (id: string, data: any) => api.put(`/farm/stock/${id}`, data),
  deleteStock: (id: string) => api.delete(`/farm/stock/${id}`),
};

// ==================== EQUIPMENT ENDPOINTS ====================

export const equipmentApi = {
  getEquipment: (farmId: string) => api.get(`/farm/equipment/farm/${farmId}`),
  addEquipment: (farmId: string, data: any) => api.post(`/farm/equipment/farm/${farmId}`, data),
  updateEquipment: (id: string, data: any) => api.put(`/farm/equipment/${id}`, data),
  deleteEquipment: (id: string) => api.delete(`/farm/equipment/${id}`),
};

// ==================== FINANCE ENDPOINTS ====================

export const financeApi = {
  getTransactions: (farmId: string, params?: any) =>
    api.get(`/farm/transactions/farm/${farmId}`, { params }),
  addTransaction: (farmId: string, data: any) =>
    api.post(`/farm/transactions/farm/${farmId}`, data),
  deleteTransaction: (id: string) => api.delete(`/farm/transactions/${id}`),
  getSummary: (farmId: string, period?: string) =>
    api.get(`/farm/transactions/farm/${farmId}/summary`, { params: { period } }),
};

// ==================== PRICE ENDPOINTS ====================

export const priceApi = {
  getPrices: (farmId: string) => api.get(`/farm/prices/farm/${farmId}`),
  getPrice: (id: string) => api.get(`/farm/prices/${id}`),
  setPrice: (farmId: string, data: any) => api.post(`/farm/prices/farm/${farmId}`, data),
  updatePrice: (id: string, data: any) => api.put(`/farm/prices/${id}`, data),
  deletePrice: (id: string) => api.delete(`/farm/prices/${id}`),
  getSuggestedProducts: (farmId: string) => api.get(`/farm/prices/farm/${farmId}/suggested`),
};

// ==================== TEAM ENDPOINTS ====================

export const teamApi = {
  getTeam: (farmId: string) => api.get(`/farm/team/farm/${farmId}`),
  addMember: (farmId: string, data: any) => api.post(`/farm/team/farm/${farmId}`, data),
  updateMember: (id: string, data: any) => api.put(`/farm/team/${id}`, data),
  deleteMember: (id: string) => api.delete(`/farm/team/${id}`),
  toggleMember: (id: string) => api.put(`/farm/team/${id}/toggle`),
};

// ==================== TASK ENDPOINTS ====================

export const taskApi = {
  getTasks: (farmId: string) => api.get(`/farm/tasks/farm/${farmId}`),
  createTask: (farmId: string, data: any) => api.post(`/farm/tasks/farm/${farmId}`, data),
  updateTask: (id: string, data: any) => api.put(`/farm/tasks/${id}`, data),
  updateTaskStatus: (id: string, status: string) =>
    api.put(`/farm/tasks/${id}/status`, { status }),
  deleteTask: (id: string) => api.delete(`/farm/tasks/${id}`),
};

// ==================== MARKET ENDPOINTS ====================

export const marketApi = {
  getMarketStatus: () => api.get('/farm/market/status'),
  getMyProducts: (params?: any) => api.get('/farm/market/products', { params }),
  addProduct: (data: any) => api.post('/farm/market/products', data),
  updateProduct: (id: string, data: any) => api.put(`/farm/market/products/${id}`, data),
  updateProductStatus: (id: string, status: string) =>
    api.put(`/farm/market/products/${id}/status`, { status }),
  deleteProduct: (id: string) => api.delete(`/farm/market/products/${id}`),
  getInquiries: (params?: any) => api.get('/farm/market/inquiries', { params }),
  markInquiryRead: (id: string) => api.put(`/farm/market/inquiries/${id}/read`),
  deleteInquiry: (id: string) => api.delete(`/farm/market/inquiries/${id}`),
  uploadImage: (formData: FormData) =>
    api.post('/farm/market/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ==================== ALERT ENDPOINTS ====================

export const alertApi = {
  getAlerts: (farmId: string) => api.get(`/farm/alerts/farm/${farmId}`),
  markRead: (id: string) => api.put(`/farm/alerts/${id}/read`),
};

// ==================== WEATHER ENDPOINTS ====================

export const weatherApi = {
  getFarmWeather: (farmId: string) => api.get(`/farm/weather/farm/${farmId}`),
  refreshWeather: (farmId: string) => api.post(`/farm/weather/farm/${farmId}/refresh`),
};

// ==================== SENSOR ENDPOINTS ====================

export const sensorApi = {
  getFieldReadings: (fieldId: string, limit = 50) =>
    api.get(`/farm/sensors/field/${fieldId}?limit=${limit}`),
  getDeviceReadings: (deviceId: string, limit = 50) =>
    api.get(`/farm/sensors/device/${deviceId}?limit=${limit}`),
};

// ==================== CHAT ENDPOINTS ====================

export const chatApi = {
  getChats: () => api.get('/farm/chat'),
  getChat: (id: string) => api.get(`/farm/chat/${id}`),
  startChat: (data: any) => api.post('/farm/chat', data),
  sendMessage: (id: string, message: string) =>
    api.post(`/farm/chat/${id}/message`, { message }),
  deleteChat: (id: string) => api.delete(`/farm/chat/${id}`),
  clearChats: () => api.delete('/farm/chat/clear'),
};

// ==================== IMAGE ENDPOINTS ====================

export const imageApi = {
  uploadImage: (formData: FormData) =>
    api.post('/farm/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadImageByUrl: (data: any) => api.post('/farm/images/upload-by-url', data),
  getImage: (id: string) => api.get(`/farm/images/${id}`),
  getFieldImages: (fieldId: string) => api.get(`/farm/images/field/${fieldId}`),
  deleteImage: (id: string) => api.delete(`/farm/images/${id}`),
};

// ==================== FIELD SCAN ENDPOINTS ====================

export const fieldScanApi = {
  getSettings: () => api.get('/farm/field-scan/settings'),
  getHistory: () => api.get('/farm/field-scan/history'),
  getScan: (id: string) => api.get(`/farm/field-scan/${id}`),
  analyze: (data: any) => api.post('/farm/field-scan/analyze', data),
};

// ==================== PLAN ENDPOINTS ====================

export const planApi = {
  getPlans: () => api.get('/farm/plans'),
  // REMOVED: submitUpgrade — upgrade payments now use PayWithMpesaModal via invoice
};

// ==================== RENEWAL ENDPOINTS ====================

export const renewalApi = {
  getSubscription: () => api.get('/farm/renewal/subscription'),
  // REMOVED: submitRenewal — renewal payments now use PayWithMpesaModal via invoice
};

// ==================== REPORT ENDPOINTS ====================

export const reportApi = {
  getReport: (farmId: string, params?: any) =>
    api.get(`/farm/reports/farm/${farmId}`, { params }),
};