// Form data types
export interface InvoiceItem {
  product_id?: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface InvoiceFormData {
  invoice_id: string;
  subtotal: number;
  tax: number;
  total: number;
  payment_method: string;
  currency: string;
  voucher?: number;
  invoice_items: InvoiceItem[];
}

export interface LoginFormData {
  email: string;
  password: string;
}
