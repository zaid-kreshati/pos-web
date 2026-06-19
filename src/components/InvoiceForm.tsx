import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceFormSchema } from '../utils/validation';
import type { InvoiceFormSchema } from '../utils/validation';
import { LineItemsInput } from './LineItemsInput';
import { LoadingSpinner } from './LoadingSpinner';
import { useToast } from '../hooks/useToast';
import { createInvoice } from '../api/invoiceApi';
import { formatNumber } from '../utils/formatters';
import { DEFAULT_CURRENCY } from '../utils/constants';
import { Copy, Check } from 'lucide-react';

export const InvoiceForm: React.FC = () => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUuid, setCreatedUuid] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<InvoiceFormSchema>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoice_id: '',
      subtotal: 0,
      tax: 0,
      total: 0,
      payment_method: 'cash',
      currency: DEFAULT_CURRENCY,
      voucher: undefined,
      invoice_items: [],
    },
  });

  const invoiceItems = watch('invoice_items');
  const subtotal = watch('subtotal');
  const tax = watch('tax');
  const total = watch('total');

  // Calculate totals from items
  const calculatedSubtotal =
    invoiceItems?.reduce((sum, item) => sum + (item.quantity * item.unit_price || 0), 0) || 0;

  const onSubmit = async (data: InvoiceFormSchema) => {
    setIsSubmitting(true);
    try {
      const response = await createInvoice(data);
      setCreatedUuid(response.data.uuid);
      addToast(`Invoice created successfully! UUID: ${response.data.uuid}`, 'success');
      reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create invoice';
      addToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyUuid = () => {
    if (createdUuid) {
      navigator.clipboard.writeText(createdUuid);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  // Show success screen with UUID
  if (createdUuid) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Invoice Created Successfully!</h2>
          <p className="text-green-700 mb-6">Your invoice has been created and NFC tag is being written.</p>

          <div className="bg-white border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Invoice UUID:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-lg font-mono font-bold text-gray-900 break-all">{createdUuid}</code>
              <button
                onClick={handleCopyUuid}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Copy UUID"
              >
                {copiedToClipboard ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={() => setCreatedUuid(null)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            Create Another Invoice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Invoice</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Section */}
          <section className="border-b border-gray-200 pb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Invoice ID */}
              <div>
                <label htmlFor="invoice_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice ID *
                </label>
                <input
                  {...register('invoice_id')}
                  type="text"
                  id="invoice_id"
                  placeholder="e.g., INV-2026-001"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.invoice_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.invoice_id && (
                  <p className="text-red-600 text-sm mt-1">{errors.invoice_id.message}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <input
                  {...register('payment_method')}
                  type="text"
                  id="payment_method"
                  placeholder="e.g., cash, card"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.payment_method ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.payment_method && (
                  <p className="text-red-600 text-sm mt-1">{errors.payment_method.message}</p>
                )}
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <input
                  {...register('currency')}
                  type="text"
                  id="currency"
                  placeholder="EUR"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                    errors.currency ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.currency && (
                  <p className="text-red-600 text-sm mt-1">{errors.currency.message}</p>
                )}
              </div>

              {/* Voucher (optional) */}
              <div>
                <label htmlFor="voucher" className="block text-sm font-medium text-gray-700 mb-2">
                  Voucher / Discount (Optional)
                </label>
                <input
                  {...register('voucher', { valueAsNumber: true })}
                  type="number"
                  id="voucher"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </section>

          {/* Line Items Section */}
          <section className="border-b border-gray-200 pb-8">
            <LineItemsInput control={control} register={register} watch={watch} formState={formState} />
            {errors.invoice_items && (
              <p className="text-red-600 text-sm mt-2">{errors.invoice_items.message}</p>
            )}
          </section>

          {/* Pricing Section */}
          <section className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Pricing Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Subtotal (calculated from items):</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatNumber(calculatedSubtotal)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <label htmlFor="subtotal" className="text-gray-700">
                  Subtotal (manual) *:
                </label>
                <input
                  {...register('subtotal', { valueAsNumber: true })}
                  type="number"
                  id="subtotal"
                  step="0.01"
                  min="0"
                  className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex justify-between items-center">
                <label htmlFor="tax" className="text-gray-700">
                  Tax *:
                </label>
                <input
                  {...register('tax', { valueAsNumber: true })}
                  type="number"
                  id="tax"
                  step="0.01"
                  min="0"
                  className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                <label htmlFor="total" className="text-lg font-semibold text-gray-900">
                  Total *:
                </label>
                <input
                  {...register('total', { valueAsNumber: true })}
                  type="number"
                  id="total"
                  step="0.01"
                  min="0"
                  className="w-32 px-3 py-2 text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {errors.subtotal && (
              <p className="text-red-600 text-sm">{errors.subtotal.message}</p>
            )}
            {errors.tax && (
              <p className="text-red-600 text-sm">{errors.tax.message}</p>
            )}
            {errors.total && (
              <p className="text-red-600 text-sm">{errors.total.message}</p>
            )}
          </section>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-white transition flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner />
                  <span>Creating Invoice...</span>
                </>
              ) : (
                'Create Invoice'
              )}
            </button>

            <button
              type="reset"
              onClick={() => reset()}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
