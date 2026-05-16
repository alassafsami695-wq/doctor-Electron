// ===== Auth Types =====
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'doctor' | 'staff';
  permissions: string[];
  has_active_subscription?: boolean;
  subscription?: {
    status?: 'active' | 'expired' | string;
  };
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: string;
  user: User;
  has_active_subscription: boolean;
}

export interface DoctorCode {
  id: number;
  code: string;
  is_used: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// ===== Patient Types =====
export interface Patient {
  id: number;
  full_name: string;
  phone?: string;
  email?: string;
  birth_date?: string;
  gender?: 'male' | 'female';
  address?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  panorama_image?: string;
  dental_history_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PatientDetail extends Patient {
  dental_history: DentalChart[];
  appointments: Appointment[];
  invoices: Invoice[];
}

// ===== Appointment Types =====
export interface Appointment {
  id: number;
  patient_id: number;
  patient?: Patient;
  doctor?: User;
  appointment_date: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  duration: number;
  created_at: string;
}

// ===== Dental Chart / Odontogram Types =====
export interface DentalChart {
  id: number;
  patient_id: number;
  tooth_number: number;
  procedure_id?: number;
  procedure?: Procedure;
  final_price: number;
  paid_now: number;
  currency: 'USD' | 'SYP';
  doctor_notes: string;
  state: 'completed' | 'pending' | 'cancelled';
  created_at: string;
}

export interface Tooth {
  number: number;
  status: 'healthy' | 'caries' | 'filled' | 'missing' | 'crown' | 'root_canal' | 'extracted' | 'implant';
  procedures: DentalChart[];
  notes?: string;
}

// ===== Procedure Types =====
export interface Procedure {
  id: number;
  name: string;
  default_price: number;
  created_at?: string;
}

// ===== Invoice / Payment Types =====
export interface Invoice {
  id: number;
  patient_id: number;
  patient?: Patient;
  total_amount: number;
  paid_amount: number;
  discount: number;
  remaining_amount: number;
  status: 'paid' | 'partially_paid' | 'unpaid';
  currency?: 'USD' | 'SYP';
  payments?: Payment[];
  created_at: string;
}

export interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  payment_method: 'cash' | 'card' | 'transfer';
  payment_date: string;
  notes?: string;
}

export interface FinancialStats {
  total_income: number;
  total_expenses: number;
  doctor_balance: number;
}

// ===== Expense Types =====
export interface Expense {
  id: number;
  category: string;
  amount: number;
  expense_date: string;
  description?: string;
  created_at?: string;
}

// ===== Lab Order Types =====
export interface LabOrder {
  id: number;
  patient_id: number;
  patient?: Patient;
  lab_name: string;
  work_type: string;
  tooth_number?: number;
  cost: number;
  sent_date: string;
  expected_date?: string;
  status: 'ordered' | 'received' | 'fitted';
  created_at?: string;
}

// ===== Partner Types =====
export interface Partner {
  id: number;
  name: string;
  type: 'lab' | 'company';
  contact?: string;
  user_id: number;
  logs?: PartnerLog[];
  created_at?: string;
}

export interface PartnerLog {
  id: number;
  partner_id: number;
  type: 'order' | 'payment' | 'debt';
  amount: number;
  note?: string;
  transaction_date: string;
  created_at?: string;
}

// ===== Staff Types =====
export interface Staff {
  id: number;
  name: string;
  email: string;
  permissions: string[];
  is_active: boolean;
  created_at?: string;
}

// ===== Dashboard / Stats Types =====
export interface ClinicStats {
  total_patients: number;
  ongoing_cases: number;
  total_invoices: number; // 👈 أضف هذا السطر هنا
  alerts: {
    low_stock: number;
  };
}

export interface SuperAdminStats {
  active_subscriptions: number;
  total_clinics: number;
  expiring_soon: Subscription[];
}

export interface AdminDashboardStats {
  total_clinics: number;
  active_subs: number;
  expired_subs: number;
  total_revenue: string;
  latest_clinics: User[];
}

export interface Subscription {
  id: number;
  user_id: number;
  status: 'active' | 'expired';
  starts_at: string;
  ends_at: string;
  months_duration: number;
}

// ===== UI / UX Types =====
export type ThemeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  permissions?: string[];
  badge?: number;
}

export type ViewMode = 'grid' | 'list' | 'table';