// ==================== SCOPE TYPES ====================

export type Scope = 'pending' | 'active' | 'expired' | 'rejected';

// ==================== USER TYPES ====================

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'farmer' | 'worker' | 'vet' | 'manager';
  county?: string;
  subCounty?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  selectedPlan?: string;
  paymentStatus?: 'paid' | 'unpaid' | 'failed' | 'pending_verification';
  paymentMethod?: string;
  paymentReference?: string;
  paymentDate?: string;
  subscriptionStatus?: 'active' | 'expired' | 'pending_renewal' | 'cancelled';
  subscriptionExpiry?: string | null;
  farm?: string;
  lastLogin?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== INVOICE + PAYMENT TYPES ====================

export interface PaymentInstruction {
  code: 'mpesa_stk' | 'mpesa_send_money' | 'mpesa_till' | 'mpesa_paybill' | 'bank' | 'cash' | 'stripe';
  title: string;
  description: string;
  steps: string[];
  recipient: {
    phone?: string;
    tillNumber?: string;
    paybillNumber?: string;
    accountNumber?: string;
    bankName?: string;
    accountName?: string;
    branch?: string;
    swift?: string;
  };
  action?: {
    type: 'stk' | 'stripe';
    label: string;
  };
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  amountDue: number;
  amountPaid: number;
  total: number;
  currency: string;
  dueDate?: string;
  paidAt?: string;
  status: 'unpaid' | 'paid' | 'failed' | 'pending_verification' | 'cancelled';
  paymentMethod?: string;
  paymentRef?: string;
  paymentInstructions?: PaymentInstruction[];
  invoiceUrl?: string;
  lineItems?: InvoiceLineItem[];
  subtotal?: number;
  discount?: number;
  tax?: number;
}

export interface PaymentMethod {
  id: string;
  code: 'mpesa_stk' | 'mpesa_send_money' | 'mpesa_till' | 'mpesa_paybill' | 'bank' | 'cash' | 'stripe';
  label: string;
  mode: 'auto' | 'manual';
  config?: Record<string, any>;
  title: string;
  description?: string;
  steps?: string[];
  recipient?: {
    phone?: string;
    tillNumber?: string;
    paybillNumber?: string;
    accountNumber?: string;
    bankName?: string;
    accountName?: string;
    branch?: string;
    swift?: string;
  };
  action?: {
    type: 'stk' | 'stripe';
    label: string;
  };
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
  deviceId?: string;
  type?: string;
  serialNumber?: string;
  sensorType?: string;
  zone?: 'field' | 'storage' | 'greenhouse' | 'livestock';
  farm: string | { _id: string; name: string };
  field?: { _id: string; name: string };
  status?: 'online' | 'offline' | 'maintenance';
  batteryLevel?: number;
  firmwareVersion?: string;
  lastSeen?: string;
  lastReading?: string;
  lastReadingAt?: string;
  isVirtual?: boolean;
  isVirtualDevice?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== ANIMAL TYPES ====================

export interface Animal {
  _id: string;
  name?: string;
  tag?: string;
  tagId?: string;
  type: string;
  breed?: string;
  category?: string;
  gender?: 'male' | 'female';
  weight?: number;
  farm: string;
  status?: 'active' | 'sold' | 'dead';
  isBatch?: boolean;
  batchName?: string;
  batchQuantity?: number;
  batchCurrent?: number;
  birthDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== HEALTH TYPES ====================

export interface HealthRecord {
  _id: string;
  animal: string | { _id: string; name?: string; tagId?: string };
  type?: 'vaccination' | 'treatment' | 'checkup' | 'disease' | 'deworming';
  recordType?: 'vaccination' | 'treatment' | 'checkup' | 'disease' | 'deworming';
  description?: string;
  diagnosis?: string;
  treatment?: string;
  medication?: string;
  dosage?: string;
  date: string;
  cost?: number;
  vet?: string;
  vetName?: string;
  vetContact?: string;
  nextCheckup?: string;
}

// ==================== PRODUCTION TYPES ====================

export interface ProductionRecord {
  _id: string;
  farm: string;
  type: string;
  product?: string;
  quantity: number;
  unit: string;
  quality?: 'grade_a' | 'grade_b' | 'grade_c';
  date: string;
  notes?: string;
  animal?: { _id: string; name?: string; tagId?: string };
  field?: { _id: string; name: string };
  totalValue?: number;
}

// ==================== INVENTORY TYPES ====================

export interface InventoryItem {
  _id: string;
  farm: string;
  name: string;
  product?: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit?: number;
  cost?: number;
  minimumStock?: number;
  reorderLevel?: number;
  lowStockAlert?: number;
  purchaseDate?: string;
  expiryDate?: string;
  supplier?: string;
}

// ==================== EQUIPMENT TYPES ====================

export interface Equipment {
  _id: string;
  farm: string;
  name: string;
  type?: string;
  category?: string;
  status?: 'active' | 'maintenance' | 'retired';
  condition?: 'new' | 'good' | 'fair' | 'poor' | 'broken';
  purchaseDate?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  cost?: number;
  maintenanceFrequency?: string;
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

export interface PriceItem {
  _id: string;
  farm: string;
  product: string;
  category: string;
  unit: string;
  pricePerUnit: number;
  quality?: 'grade_a' | 'grade_b' | 'grade_c';
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
  temperature: {
    min?: number;
    max?: number;
    avg?: number;
  } | number;
  humidity: number;
  rainfall?: number;
  windSpeed?: number;
  condition: string;
  updatedAt?: string;
  forecast?: Array<{
    date: string;
    temperature?: number;
    tempMin?: number;
    tempMax?: number;
    condition: string;
    rainfall?: number;
  }>;
  alerts?: Array<{
    message: string;
    severity: 'low' | 'medium' | 'high';
    recommendation?: string;
  }>;
}

// ==================== SENSOR TYPES ====================

export interface SensorReading {
  _id: string;
  field?: string;
  device?: string;
  type?: string;
  value?: number;
  unit?: string;
  temperature?: number;
  humidity?: number;
  soilMoisture?: number;
  lightLevel?: number;
  co2?: number;
  motion?: boolean;
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

// ==================== SCAN TYPES ====================

export interface CropScanResult {
  _id: string;
  field: Field;
  cropType: string;
  imageUrl: string;
  diseaseDetected?: string;
  severity?: 'low' | 'moderate' | 'high';
  confidence?: number;
  symptoms?: string;
  recommendation?: string;
  analysis?: {
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
    weeds?: { hotspots?: any[] };
    healthyPercentage?: number;
    diseases?: Array<{
      name: string;
      severity: string;
      location?: { lat: number; lng: number };
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
  virtualDevicesEnabled?: boolean;
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
    farmerLimits?: { daily: number; weekly: number; monthly: number };
    fieldLimits?: { daily: number; weekly: number; monthly: number };
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
  Pending: undefined;
  Invoice: { invoiceNumber: string };
  Renewal: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
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
};

// ==================== FEATURE KEY TYPES ====================

export type FeatureKey =
  | 'crop_scan'
  | 'field_scan'
  | 'field_scan_manual'
  | 'livestock'
  | 'health'
  | 'production'
  | 'inventory'
  | 'finance'
  | 'weather'
  | 'ai_chat'
  | 'team'
  | 'market'
  | 'reports'
  | 'alerts'
  | 'iot_field_sensors'
  | 'storage_monitoring'
  | 'co2_detection'
  | 'pir_detection';