import Constants from 'expo-constants';
import { getCountyOptions, getConstituencyOptions } from './counties';

// App Constants
export const APP_NAME = 'FarmVexa';
export const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

// County Options (from counties.ts)
export const COUNTY_OPTIONS = getCountyOptions();
export const CONSTITUENCY_OPTIONS = getConstituencyOptions();

// Crop Types
export const CROP_TYPES = [
  { value: 'tomato', label: 'Tomato' },
  { value: 'maize', label: 'Maize' },
  { value: 'potato', label: 'Potato' },
  { value: 'bean', label: 'Bean' },
  { value: 'cassava', label: 'Cassava' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'tea', label: 'Tea' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'rice', label: 'Rice' },
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'other', label: 'Other' },
];

// Product Categories
export const PRODUCT_CATEGORIES = [
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'poultry', label: 'Poultry' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'grains', label: 'Grains' },
  { value: 'other', label: 'Other' },
];

// Team Roles
export const TEAM_ROLES = [
  { value: 'worker', label: 'Worker' },
  { value: 'vet', label: 'Vet' },
  { value: 'manager', label: 'Manager' },
  { value: 'other', label: 'Other' },
];

// Task Priorities
export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'mpesa_stk', label: 'M-Pesa STK Push' },
  { value: 'mpesa_send_money', label: 'M-Pesa Send Money' },
  { value: 'mpesa_till', label: 'M-Pesa Till Number' },
  { value: 'mpesa_paybill', label: 'M-Pesa Paybill' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'card', label: 'Card Payment' },
];

// Stock Units
export const STOCK_UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Liter (L)' },
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'piece', label: 'Piece' },
  { value: 'bag', label: 'Bag' },
  { value: 'bale', label: 'Bale' },
  { value: 'box', label: 'Box' },
  { value: 'crate', label: 'Crate' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'sack', label: 'Sack' },
  { value: 'ton', label: 'Ton' },
  { value: 'other', label: 'Other' },
];

// Animal Types
export const ANIMAL_TYPES = [
  { value: 'cattle', label: 'Cattle' },
  { value: 'goat', label: 'Goat' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'pig', label: 'Pig' },
  { value: 'chicken', label: 'Chicken' },
  { value: 'duck', label: 'Duck' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'bee', label: 'Bee' },
  { value: 'fish', label: 'Fish' },
  { value: 'other', label: 'Other' },
];

// Equipment Types
export const EQUIPMENT_TYPES = [
  { value: 'tractor', label: 'Tractor' },
  { value: 'plough', label: 'Plough' },
  { value: 'harvester', label: 'Harvester' },
  { value: 'irrigation', label: 'Irrigation System' },
  { value: 'sprayer', label: 'Sprayer' },
  { value: 'generator', label: 'Generator' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'tool', label: 'Tool' },
  { value: 'other', label: 'Other' },
];

// Transaction Categories
export const INCOME_CATEGORIES = [
  { value: 'crop_sales', label: 'Crop Sales' },
  { value: 'livestock_sales', label: 'Livestock Sales' },
  { value: 'product_sales', label: 'Product Sales' },
  { value: 'grants', label: 'Grants' },
  { value: 'loans', label: 'Loans' },
  { value: 'other_income', label: 'Other Income' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'seeds', label: 'Seeds' },
  { value: 'fertilizer', label: 'Fertilizer' },
  { value: 'pesticides', label: 'Pesticides' },
  { value: 'feed', label: 'Animal Feed' },
  { value: 'labour', label: 'Labour' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'transport', label: 'Transport' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'rent', label: 'Rent' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other_expense', label: 'Other Expense' },
];

// Sensor Types
export const SENSOR_TYPES = [
  { value: 'soil_moisture', label: 'Soil Moisture' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'humidity', label: 'Humidity' },
  { value: 'co2', label: 'CO2' },
  { value: 'pir', label: 'PIR Motion' },
  { value: 'ph', label: 'pH Level' },
  { value: 'light', label: 'Light' },
  { value: 'other', label: 'Other' },
];

// Priority Colors
export const PRIORITY_COLORS = {
  low: '#dbeafe',
  medium: '#fef9c3',
  high: '#ffedd5',
  urgent: '#fee2e2',
};

// File Upload Limits
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_PRODUCT_PHOTOS = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;

// Timeouts
export const API_TIMEOUT = 30000;
export const SOCKET_TIMEOUT = 10000;

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  REGISTRATION_DATA: 'registrationData',
};