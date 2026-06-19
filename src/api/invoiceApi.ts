import apiClient from './client';
import { ENDPOINTS } from '../utils/constants';
import type { InvoiceFormData } from '../types/forms';
import type { CreateInvoiceResponse } from '../types/api';

export const createInvoice = async (data: InvoiceFormData): Promise<CreateInvoiceResponse> => {
  const response = await apiClient.post<CreateInvoiceResponse>(ENDPOINTS.INVOICES.CREATE, data);
  return response.data;
};
