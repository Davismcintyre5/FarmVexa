// ==================== USER TYPES ====================

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'farmer' | 'worker' | 'vet' | 'manager';
  county?: string;
  subCounty?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  selectedPlan?: string;
  farm?: string;
  lastLogin?: string;
  subscriptionExpiry?: string;
  subscriptionStatus?: 'active' | 'expired' | 'pending';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== FARM TYPES ====================

export interface FarmLocation {
  county?: string;
  subCounty?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface FarmSize {
  value?: number;
  unit?: string;
}

export interface Farm {
  _id: string;
  name: string;
  location?: FarmLocation;
  size?: FarmSize;
  status?: 'active' | 'inactive';
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== FIELD TYPES ====================

export interface Field {
  _id: string;
  name: string;
  farm: string;
  crop?: string;
  size?: FarmSize;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

// ==================== DEVICE TYPES ====================

export interface Device {
  _id: string;
  name: string;
  type: string;
  serialNumber?: string;
  farm: string;
  status?: 'online' | 'offline' | 'maintenance';
  lastReading?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== ANIMAL TYPES ====================

export interface Animal {
  _id: string;
  name?: string;
  tag?: string;
  type: string;
  breed?: string;
  farm: string;
  status?: 'active' | 'sold' | 'dead';
  birthDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== HEALTH TYPES ====================

export interface HealthRecord {
  _id: string;
  animal: string;
  type: 'vaccination' | 'treatment' | 'checkup';
  description?: string;
  date: string;
  cost?: number;
  vet?: string;
}

// ==================== PRODUCTION TYPES ====================

export interface ProductionRecord {
  _id: string;
  farm: string;
  product: string;
  quantity: number;
  unit: string;
  date: string;
  notes?: string;
}

// ==================== INVENTORY TYPES ====================

export interface InventoryItem {
  _id: string;
  farm: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit?: number;
  reorderLevel?: number;
}

// ==================== EQUIPMENT TYPES ====================

export interface Equipment {
  _id: string;
  farm: string;
  name: string;
  type: string;
  status?: 'active' | 'maintenance' | 'retired';
  purchaseDate?: string;
  lastMaintenance?: string;
}

// ==================== FINANCE TYPES ====================

export interface Transaction {
  _id: string;
  farm: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description?: string;
}

// ==================== TEAM TYPES ====================

export interface TeamMember {
  _id: string;
  farm: string;
  name: string;
  role: 'worker' | 'vet' | 'manager' | 'other';
  phone?: string;
  email?: string;
  salary?: number;
  hireDate?: string;
  status?: 'active' | 'inactive';
}

// ==================== TASK TYPES ====================

export interface Task {
  _id: string;
  farm: string;
  title: string;
  description?: string;
  assignedTo?: TeamMember;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  createdAt?: string;
}

// ==================== MARKET TYPES ====================

export interface MarketProduct {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  farm: string;
  photos?: string[];
  status: 'active' | 'sold' | 'inactive';
  contactPhone?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  location?: {
    county?: string;
    subCounty?: string;
    exactDirection?: string;
  };
}

export interface Inquiry {
  _id: string;
  product: MarketProduct;
  buyerName: string;
  message: string;
  buyerPhone?: string;
  buyerEmail?: string;
  isRead: boolean;
  createdAt: string;
}

// ==================== ALERT TYPES ====================

export interface Alert {
  _id: string;
  farm: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
}

// ==================== WEATHER TYPES ====================

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall?: number;
  condition: string;
  forecast?: Array<{
    date: string;
    temperature: number;
    condition: string;
  }>;
}

// ==================== SENSOR TYPES ====================

export interface SensorReading {
  _id: string;
  field?: string;
  device?: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
}

// ==================== CHAT TYPES ====================

export interface ChatMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Chat {
  _id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// ==================== PLAN TYPES ====================

export interface Plan {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  currency?: string;
  interval: 'monthly' | 'one_time';
  features?: string[];
  maxFarms?: number;
  maxDevices?: number;
  aiRequestsPerDay?: number;
  status?: 'available' | 'current' | 'purchased' | 'upgrade_available';
  upgradeCost?: number;
}

// ==================== SUBSCRIPTION TYPES ====================

export interface Subscription {
  plan: string;
  planPrice?: number;
  planInterval?: 'monthly' | 'one_time';
  subscriptionStatus?: 'active' | 'expired' | 'pending';
  subscriptionExpiry?: string;
  isExpired?: boolean;
  lastRenewalDate?: string;
  renewalCount?: number;
  pendingRenewal?: {
    submittedAt: string;
    reference: string;
    amount: number;
    paymentMethod: string;
  };
}

// ==================== PAYMENT TYPES ====================

export interface PaymentMethod {
  id: string;
  type: 'mpesa_stk' | 'mpesa_send_money' | 'mpesa_till' | 'mpesa_paybill' | 'bank' | 'card';
  name: string;
  details?: {
    phoneNumber?: string;
    tillNumber?: string;
    paybill?: string;
    accountNumber?: string;
    bankName?: string;
    accountName?: string;
  };
}

// ==================== SCAN TYPES ====================

export interface CropScanResult {
  _id: string;
  field: Field;
  cropType: string;
  imageUrl: string;
  analysis: {
    disease?: string;
    confidence?: number;
    severity?: string;
    recommendation?: string;
  };
  createdAt: string;
}

export interface FieldScanResult {
  _id: string;
  field: Field;
  cropType: string;
  status: 'completed' | 'failed' | 'processing';
  summary?: {
    diseaseCount?: number;
    weeds?: {
      hotspots?: any[];
    };
    healthyPercentage?: number;
    diseases?: Array<{
      name: string;
      severity: string;
      location?: {
        lat: number;
        lng: number;
      };
    }>;
  };
  photos?: Array<{
    imageUrl: string;
    analysis?: {
      disease?: string;
      confidence?: number;
      severity?: string;
      recommendation?: string;
      weeds?: boolean;
      pests?: boolean;
    };
  }>;
  totalFrames?: number;
  analyzedFrames?: number;
  skippedFrames?: number;
  skipReasons?: Record<string, number>;
  geminiRequests?: number;
  duration?: number;
  createdAt: string;
}

// ==================== PUBLIC SETTINGS TYPES ====================

export interface PublicSettings {
  appName?: string;
  supportPhone?: string;
  supportEmail?: string;
  whatsappNumber?: string;
  showWhatsapp?: boolean;
  allowSelfRegistration?: boolean;
  allowExternalCamera?: boolean;
  externalCameraInUrl?: string;
  externalCameraOutUrl?: string;
  marketEnabled?: boolean;
  downloads?: Array<{
    _id: string;
    name: string;
    version: string;
    link: string;
    description?: string;
    platform: string;
    enabled: boolean;
  }>;
  fieldScan?: {
    enabled: boolean;
    maxPhotosPerScan?: number;
    captureInterval?: number;
    farmerLimits?: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    fieldLimits?: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    allowedCropTypes?: string[];
    requireGpsAccuracy?: number;
    preFilterEnabled?: boolean;
    maxGeminiCallsPerScan?: number;
    minPhotoSize?: number;
    maxPhotoSize?: number;
  };
  chatbot?: {
    enabled: boolean;
    name?: string;
    greeting?: string;
    position?: string;
    primaryColor?: string;
    aiProvider?: string;
  };
  legal?: {
    termsOfService?: string;
    privacyPolicy?: string;
    cookiePolicy?: string;
  };
  paymentMethods?: PaymentMethod[];
  paymentModels?: Plan[];
}

// ==================== NAVIGATION TYPES ====================

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Pricing: undefined;
  Register: { plan?: string } | undefined;
  GetAccess: undefined;
  Checkout: undefined;
  Renewal: undefined;
  PendingApproval: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Farms: undefined;
  Scan: undefined;
  Devices: undefined;
  Operations: undefined;
  Settings: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  Notifications: undefined;
  Weather: undefined;
  SensorReadings: { fieldId?: string } | undefined;
  AIChat: undefined;
};

export type FarmsStackParamList = {
  FarmList: undefined;
  FarmDetail: { farmId: string };
  FarmCreate: undefined;
  FarmEdit: { farmId: string };
  FieldList: { farmId: string };
  FieldDetail: { fieldId: string };
  FieldCreate: { farmId: string };
  FieldEdit: { fieldId: string };
};

export type DevicesStackParamList = {
  DevicesHome: undefined;
  DeviceList: undefined;
  DeviceDetail: { deviceId: string };
  DeviceRegister: { farmId: string };
  SensorReadings: { fieldId?: string } | undefined;
  Weather: undefined;
};

export type ScanStackParamList = {
  ScanHome: undefined;
  CropScan: { fieldId?: string } | undefined;
  ScanResult: { scanId: string };
  ScanHistory: { fieldId?: string } | undefined;
  FieldScan: undefined;
  FieldScanResult: { scanId: string };
  FieldScanHistory: undefined;
};

export type OperationsStackParamList = {
  OperationsHome: undefined;
  AIChat: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  DocumentsTab: undefined;
  DownloadsTab: undefined;
  SupportTab: undefined;
  Plans: undefined;
  UpgradeCheckout: { planName: string };
};