import React, { useEffect, useState } from "react";
import {
  useFieldArray,
  type Control,
  type UseFormWatch,
  type UseFormRegister,
  type UseFormSetValue,
  type FormState,
} from "react-hook-form";
import { Plus, Trash2, ShoppingCart } from "lucide-react";

import type { InvoiceFormSchema } from "../utils/validation";
import { formatNumber } from "../utils/formatters";
import { getProducts } from "../api/invoiceApi";
import type { Product } from "../types/api";

interface LineItemsInputProps {
  control: Control<InvoiceFormSchema>;
  register: UseFormRegister<InvoiceFormSchema>;
  watch: UseFormWatch<InvoiceFormSchema>;
  setValue: UseFormSetValue<InvoiceFormSchema>;
  formState: FormState<InvoiceFormSchema>;
}

export const LineItemsInput: React.FC<LineItemsInputProps> = ({
  control,
  register,
  watch,
  setValue,
  formState,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "invoice_items",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const invoiceItems = watch("invoice_items");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const data = await getProducts();

        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const calculatedSubtotal =
    invoiceItems?.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;

      return sum + quantity * price;
    }, 0) || 0;

  const tax = watch("tax");
  const voucher = watch("voucher");

  useEffect(() => {
    setValue("subtotal", calculatedSubtotal);

    setValue(
      "total",
      calculatedSubtotal + (Number(tax) || 0) - (Number(voucher) || 0),
    );
  }, [calculatedSubtotal, tax, voucher, setValue]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-600/20 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Line Items
          </h3>
        </div>

        <button
          type="button"
          onClick={() =>
            append({
              product_id: undefined,
              product_name: "",
              quantity: 1,
              unit_price: 0,
              total: 0,
            })
          }
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-red-500 text-sm">At least one item is required</p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const quantity = invoiceItems?.[index]?.quantity || 0;
          const unitPrice = invoiceItems?.[index]?.unit_price || 0;
          const total = quantity * unitPrice;

          return (
            <div
              key={field.id}
              className="border border-slate-700 rounded-2xl p-5 space-y-4 bg-slate-900"
            >
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Product
                </label>

                <select
                  {...register(`invoice_items.${index}.product_id`, {
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white transition"
                  onChange={(e) => {
                    const productId = Number(e.target.value);

                    const product = products.find((p) => p.id === productId);

                    if (!product) {
                      return;
                    }

                    setValue(`invoice_items.${index}.product_id`, product.id);

                    setValue(
                      `invoice_items.${index}.product_name`,
                      product.name,
                    );

                    setValue(
                      `invoice_items.${index}.unit_price`,
                      Number(product.price),
                    );
                  }}
                >
                  <option value="">
                    {loading ? "Loading products..." : "Select Product"}
                  </option>

                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>

                {/* Hidden product name field */}
                <input
                  type="hidden"
                  {...register(`invoice_items.${index}.product_name`)}
                />

                {formState.errors.invoice_items?.[index]?.product_name && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {
                      formState.errors.invoice_items[index]?.product_name
                        ?.message
                    }
                  </p>
                )}
              </div>

              {/* Quantity / Unit Price / Total */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Qty
                  </label>

                  <input
                    {...register(`invoice_items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white transition"
                  />

                  {formState.errors.invoice_items?.[index]?.quantity && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {formState.errors.invoice_items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Price
                  </label>

                  <input
                    {...register(`invoice_items.${index}.unit_price`, {
                      valueAsNumber: true,
                    })}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white transition"
                  />

                  {formState.errors.invoice_items?.[index]?.unit_price && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {
                        formState.errors.invoice_items[index]?.unit_price
                          ?.message
                      }
                    </p>
                  )}
                </div>

                {/* Total */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Total
                  </label>

                  <div className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl flex items-center">
                    <span className="text-slate-300 font-medium">
                      ${formatNumber(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hidden Total */}
              <input
                {...register(`invoice_items.${index}.total`, {
                  valueAsNumber: true,
                })}
                type="hidden"
                value={total}
              />

              {/* Remove Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};