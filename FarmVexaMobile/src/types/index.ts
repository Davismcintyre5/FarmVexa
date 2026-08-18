// User Types
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
  createdAt?: string;
  updatedAt?: string;
}

// Farm Types
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

// Field Types
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

// Animal Types
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
}

// Health Record Types
export interface HealthRecord {
  _id: string;
  animal: string;
  type: 'vaccination' | 'treatment' | 'checkup';
  description?: string;
  date: string;
  cost?: number;
  vet?: string;
}

// Production Types
export interface ProductionRecord {
  _id: string;
  farm: string;
  product: string;
  quantity: number;
  unit: string;
  date: string;
  notes?: string;
}

// Inventory Types
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

// Equipment Types
export interface Equipment {
  _id: string;
  farm: string;
  name: string;
  type: string;
  status?: 'active' | 'maintenance' | 'retired';
  purchaseDate?: string;
  lastMaintenance?: string;
}

// Transaction Types
export interface Transaction {
  _id: string;
  farm: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description?: string;
}

// Team Member Types
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

// Task Types
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

// Market Product Types
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

// Inquiry Types
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

// Alert Types
export interface Alert {
  _id: string;
  farm: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
}

// Weather Types
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

// Sensor Types
export interface SensorReading {
  _id: string;
  field?: string;
  device?: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
}

// Chat Types
export interface Chat {
  _id: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Plan Types
export interface Plan {
  _id?: string;
  name: string;
  price: number;
  interval: 'monthly' | 'one_time';
  features?: string[];
  status?: 'available' | 'current' | 'purchased' | 'upgrade_available';
  upgradeCost?: number;
}

// Subscription Types
export interface Subscription {
  plan: string;
  planPrice?: number;
  planInterval?: 'monthly' | 'one_time';
  subscriptionStatus?: 'active' | 'expired' | 'pending';
  subscriptionExpiry?: string;
  isExpired?: boolean;
  pendingRenewal?: {
    submittedAt: string;
    reference: string;
    amount: number;
    paymentMethod: string;
  };
}

// Payment Method Types
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

// Scan Types
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
  geminiRequests?: number;
  duration?: number;
  createdAt: string;
}

// Navigation Types
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
  Operations: undefined;
  Profile: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  Notifications: undefined;
};

export type FarmsStackParamList = {
  FarmList: undefined;
  FarmDetail: { farmId: string };
  FarmCreate: undefined;
  FarmEdit: { farmId: string };
  FieldDetail: { fieldId: string };
  FieldCreate: { farmId: string };
  FieldEdit: { fieldId: string };
};

export type ScanStackParamList = {
  CropScan: undefined;
  ScanResult: { scanId: string };
  ScanHistory: undefined;
  FieldScan: undefined;
  FieldScanResult: { scanId: string };
  FieldScanHistory: undefined;
};

export type OperationsStackParamList = {
  OperationsHome: undefined;
  Market: undefined;
  TeamTasks: undefined;
  Inventory: undefined;
  Finance: undefined;
  Reports: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  Plans: undefined;
  UpgradeCheckout: { planName: string };
};