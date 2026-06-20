import { z } from 'zod';

// Invoice item validation
export const invoiceItemSchema = z.object({
  product_id: z.number().optional(),
  product_name: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  total: z.number().min(0, 'Total cannot be negative'),
}).refine(
  (data) => data.product_id !== undefined || (data.product_name && data.product_name.trim() !== ''),
  {
    message: 'Either product ID or product name is required',
    path: ['product_name'],
  }
);

// Full invoice validation
export const invoiceFormSchema = z.object({
  invoice_id: z.string().min(1, 'Invoice ID is required').max(255, 'Invoice ID must be less than 255 characters'),
  subtotal: z.number().min(0, 'Subtotal cannot be negative'),
  tax: z.number().min(0, 'Tax cannot be negative'),
  total: z.number().min(0, 'Total cannot be negative'),
  payment_method: z.string().min(1, 'Payment method is required').max(255),
  currency: z.string().min(1, 'Currency is required').max(255),
  voucher: z.number().optional(),
  invoice_items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

// Login validation
export const loginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type InvoiceFormSchema = z.infer<typeof invoiceFormSchema>;
export type LoginFormSchema = z.infer<typeof loginFormSchema>;
export type InvoiceItemSchema = z.infer<typeof invoiceItemSchema>;
