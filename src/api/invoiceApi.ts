import apiClient from './client';
import { ENDPOINTS, POS_API_TOKEN } from '../utils/constants';
import type { InvoiceFormData } from '../types/forms';
import type { CreateInvoiceResponse, Product } from '../types/api';

const toInvoicePayload = (data: InvoiceFormData): InvoiceFormData => ({
  ...data,
  invoice_items: data.invoice_items.map((item) => {
    const productName = item.product_name?.trim();
    const total = item.quantity * item.unit_price;

    return {
      quantity: item.quantity,
      unit_price: item.unit_price,
      total,
      ...(item.product_id ? { product_id: item.product_id } : {}),
      ...(productName ? { product_name: productName } : {}),
    };
  }),
});

export const createInvoice = async (data: InvoiceFormData): Promise<CreateInvoiceResponse> => {
  const response = await apiClient.post<CreateInvoiceResponse>(
    ENDPOINTS.INVOICES.CREATE,
    toInvoicePayload(data),
    {
      headers: {
        Authorization: `Bearer ${POS_API_TOKEN}`,
      },
      skipAuthRedirect: true,
      
    }
  );

  return response.data;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<{ data: Product[] }>(
    ENDPOINTS.PRODUCTS.LIST,
    {
      headers: {
        Authorization: `Bearer ${POS_API_TOKEN}`,
      },
      skipAuthRedirect: true,
    }
  );

  return response.data.data;
};


