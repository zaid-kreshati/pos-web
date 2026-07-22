// API Response types
export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
}

export interface LoginResponse extends ApiResponse {
  data: {
    user: {
      id: number;
      name: string;
      email?: string;
    };
    token: string;
    role: string;
  };
}

export interface CreateInvoiceResponse extends ApiResponse {
  data: {
    uuid: string;
    nfc_url: string;
    qr_url: string;
    invoice_url: string;
    pos_device: { id: number; name: string };
  };
}

export interface LogoutResponse extends ApiResponse {
  message: string;
}

// Error response
export interface ApiError {
  status: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface Store {
  id: number;
  name: string;
  profile_image_url?: string;
}

export interface Branch {
  id: number;
  name: string;
}

export interface InvoiceItem {
  id: number;
  product_id?: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface User {
  id: number;
  name: string;
  email?: string;
}

export interface Invoice {
  id: number;
  uuid: string;
  external_invoice_id: string;
  user_id?: number;
  pos_device_id?: number;
  store_id?: number;
  branch_id?: number;
  claimed: boolean;
  claimed_at?: string;
  expires_at?: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  payment_method: string;
  voucher?: number;
  status: string;
  store?: Store;
  branch?: Branch;
  user?: User;
  items?: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
