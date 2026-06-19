import React from 'react';
import { useFieldArray } from 'react-hook-form';
import type { Control, UseFormWatch, UseFormRegister, FormState } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import type { InvoiceFormSchema } from '../utils/validation';
import { formatNumber } from '../utils/formatters';

interface LineItemsInputProps {
  control: Control<InvoiceFormSchema>;
  register: UseFormRegister<InvoiceFormSchema>;
  watch: UseFormWatch<InvoiceFormSchema>;
  formState: FormState<InvoiceFormSchema>;
}

export const LineItemsInput: React.FC<LineItemsInputProps> = ({
  control,
  register,
  watch,
  formState,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'invoice_items',
  });

  const invoiceItems = watch('invoice_items');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Invoice Items</label>
        <button
          type="button"
          onClick={() =>
            append({
              product_id: undefined,
              product_name: '',
              quantity: 1,
              unit_price: 0,
              total: 0,
            })
          }
          className="flex items-center gap-2 px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-red-600 text-sm">At least one item is required</p>
      )}

      <div className="space-y-3 overflow-x-auto">
        {fields.map((field, index) => {
          const quantity = invoiceItems?.[index]?.quantity || 0;
          const unitPrice = invoiceItems?.[index]?.unit_price || 0;
          const total = quantity * unitPrice;

          return (
            <div
              key={field.id}
              className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product ID or Name - using toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    {...register(`invoice_items.${index}.product_name`)}
                    type="text"
                    placeholder="e.g., Milk, Bread"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Or fill in product ID instead
                  </p>
                </div>

                {/* Product ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product ID (Optional)
                  </label>
                  <input
                    {...register(`invoice_items.${index}.product_id`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    placeholder="e.g., 123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    {...register(`invoice_items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {formState.errors.invoice_items?.[index]?.quantity && (
                    <p className="text-red-600 text-xs mt-1">
                      {formState.errors.invoice_items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price
                  </label>
                  <input
                    {...register(`invoice_items.${index}.unit_price`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {formState.errors.invoice_items?.[index]?.unit_price && (
                    <p className="text-red-600 text-xs mt-1">
                      {formState.errors.invoice_items[index]?.unit_price?.message}
                    </p>
                  )}
                </div>

                {/* Total (Read-only, calculated) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total
                  </label>
                  <input
                    type="text"
                    value={formatNumber(total)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                  />
                </div>
              </div>

              {/* Hidden input for total (keeps it synced) */}
              <input
                {...register(`invoice_items.${index}.total`)}
                type="hidden"
                value={total}
              />

              {/* Remove button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Item
                </button>
              </div>

              {/* Display errors */}
              {formState.errors.invoice_items?.[index]?.product_name && (
                <p className="text-red-600 text-xs">
                  {formState.errors.invoice_items[index]?.product_name?.message}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
