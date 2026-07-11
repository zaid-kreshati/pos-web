import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceFormSchema } from "../utils/validation";
import type { InvoiceFormSchema } from "../utils/validation";
import { LineItemsInput } from "./LineItemsInput";
import { LoadingSpinner } from "./LoadingSpinner";
import { useToast } from "../hooks/useToast";
import { createInvoice } from "../api/invoiceApi";
import { writeToTag } from "../api/nfcBridge";
import type { BridgeWriteResult } from "../api/nfcBridge";
import { formatNumber } from "../utils/formatters";
import { DEFAULT_CURRENCY } from "../utils/constants";
import { Copy, Check, Info, Send, ChevronLeft, ShoppingCart, FileText, Bell, Nfc, AlertTriangle, Loader2 } from "lucide-react";

type NfcStatus = "idle" | "writing" | "success" | "error";

// Human-readable message for a bridge failure.
const nfcErrorMessage = (result: BridgeWriteResult): string => {
  switch (result.error) {
    case "no_reader":
      return "لم يتم العثور على قارئ NFC. تأكد من توصيل القارئ وتشغيل الجسر.";
    case "no_tag":
    case "timeout":
      return "لم يتم تقريب البطاقة في الوقت المناسب. حاول مرة أخرى.";
    case "write_failed":
      return "فشلت الكتابة على البطاقة. حاول ببطاقة أخرى.";
    case "unreachable":
      return "تعذّر الوصول إلى جسر NFC. هل تم تشغيل start_bridge على هذا الجهاز؟";
    default:
      return result.message || "فشلت كتابة NFC.";
  }
};

export const InvoiceForm: React.FC = () => {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUuid, setCreatedUuid] = useState<string | null>(null);
  const [nfcUrl, setNfcUrl] = useState<string | null>(null);
  const [nfcStatus, setNfcStatus] = useState<NfcStatus>("idle");
  const [nfcError, setNfcError] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const { register, handleSubmit, setValue, watch, control, formState, reset } =
    useForm<InvoiceFormSchema>({
      resolver: zodResolver(invoiceFormSchema),
      defaultValues: {
        invoice_id: "INV-2026-001",
        subtotal: 0,
        tax: 0,
        total: 0,
        payment_method: "Bank Transfer",
        currency: DEFAULT_CURRENCY,
        voucher: 0,
        invoice_items: [],
      },
    });

  const { errors } = formState;
  const invoiceItems = watch("invoice_items");
  const tax = watch("tax") || 0;
  const voucher = watch("voucher") || 0;

  // Calculate totals from items
  const calculatedSubtotal =
    invoiceItems?.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price || 0),
      0,
    ) || 0;

  const calculatedTotal = calculatedSubtotal + tax - voucher;

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
      return error.message;
    }

    if (error && typeof error === "object" && "message" in error) {
      return String(error.message);
    }

    return "فشل إنشاء الفاتورة";
  };

  const onSubmit = async (data: InvoiceFormSchema) => {
    setIsSubmitting(true);
    try {
      const invoiceData = {
        ...data,
        invoice_id: data.invoice_id,
        subtotal: calculatedSubtotal,
        tax: data.tax ?? 0,
        total: calculatedTotal,
        payment_method: data.payment_method,
        currency: data.currency,
        invoice_items: data.invoice_items.map(item => ({
          ...item,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: (item.quantity * item.unit_price),

        })),
      };
      const response = await createInvoice(invoiceData);
      const url = response.data.nfc_url ?? `casher://nfc?uuid=${response.data.uuid}`;
      setCreatedUuid(response.data.uuid);
      setNfcUrl(url);
      addToast(
        `تم إنشاء الفاتورة بنجاح! UUID: ${response.data.uuid}`,
        "success",
      );
      reset();
      // Automatically try to write the tag once the invoice exists.
      void handleWriteTag(url);
    } catch (error) {
      addToast(getErrorMessage(error), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sends the invoice URL to the local NFC bridge on the POS device.
  const handleWriteTag = async (url: string) => {
    setNfcStatus("writing");
    setNfcError(null);
    const result = await writeToTag(url);
    if (result.ok) {
      setNfcStatus("success");
      addToast("تمت كتابة بطاقة NFC بنجاح!", "success");
    } else {
      setNfcStatus("error");
      const msg = nfcErrorMessage(result);
      setNfcError(msg);
      addToast(msg, "error");
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
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            تم إنشاء الفاتورة بنجاح!
          </h2>
          <p className="text-slate-400 mb-6">
            تم إنشاء الفاتورة. قرّب البطاقة من القارئ لكتابة علامة NFC.
          </p>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-400 mb-2">UUID الفاتورة:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-lg font-mono font-bold text-white break-all">
                {createdUuid}
              </code>
              <button
                onClick={handleCopyUuid}
                className="p-2 hover:bg-slate-800 rounded-lg transition"
                title="نسخ UUID"
              >
                {copiedToClipboard ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* NFC write status */}
          <div className="mb-6">
            {nfcStatus === "writing" && (
              <div className="flex items-center justify-center gap-3 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-300">
                <Loader2 className="h-5 w-5 text-green-500 animate-spin" />
                <span>جارِ كتابة البطاقة… قرّب البطاقة من القارئ</span>
              </div>
            )}
            {nfcStatus === "success" && (
              <div className="flex items-center justify-center gap-3 bg-green-600/10 border border-green-700 rounded-xl p-4 text-green-400">
                <Nfc className="h-5 w-5" />
                <span>تمت كتابة بطاقة NFC بنجاح</span>
              </div>
            )}
            {nfcStatus === "error" && (
              <div className="bg-red-600/10 border border-red-700 rounded-xl p-4 text-red-400">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{nfcError}</span>
                </div>
                <button
                  onClick={() => nfcUrl && handleWriteTag(nfcUrl)}
                  className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
                >
                  <Nfc className="h-4 w-4" />
                  إعادة المحاولة
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setCreatedUuid(null);
                setNfcUrl(null);
                setNfcStatus("idle");
                setNfcError(null);
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-xl transition"
            >
              إنشاء فاتورة جديدة
            </button>
            {nfcStatus !== "writing" && (
              <button
                onClick={() => nfcUrl && handleWriteTag(nfcUrl)}
                className="inline-flex items-center gap-2 border border-slate-700 hover:bg-slate-800 text-slate-300 font-medium py-2 px-6 rounded-xl transition"
              >
                <Nfc className="h-4 w-4" />
                كتابة البطاقة مرة أخرى
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto" dir="rtl">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1 flex-row-reverse">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
          </div>
          <div className="flex-1" />
          <button className="p-2 hover:bg-slate-800 rounded-lg transition">
            <Bell className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-1">
          إنشاء فاتورة جديدة
        </h1>
        <p className="text-slate-500 text-sm">
          مسودة الفاتورة INV-2026-001
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6 flex-row-reverse">
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 border border-slate-700 rounded-xl text-slate-300 font-medium hover:bg-slate-800 transition text-sm"
        >
          إعادة تعيين النموذج
        </button>
        <button
          type="submit"
          form="invoice-form"
          disabled={isSubmitting}
          className={`px-6 py-2.5 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 text-sm ${
            isSubmitting
              ? "bg-slate-700 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          }`}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              <span>جاري إنشاء الفاتورة...</span>
            </>
          ) : (
            "إنشاء الفاتورة"
          )}
        </button>
      </div>

      <form id="invoice-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic Information Section */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6 flex-row-reverse">
            <h3 className="text-lg font-semibold text-white">
              المعلومات الأساسية
            </h3>
            <div className="w-9 h-9 bg-green-600/20 rounded-full flex items-center justify-center">
              <Info className="w-5 h-5 text-green-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Invoice ID */}
            <div>
              <label
                htmlFor="invoice_id"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                رقم الفاتورة
              </label>
              <input
                {...register("invoice_id")}
                type="text"
                id="invoice_id"
                placeholder="مثال: INV-2026-001"
                className={`w-full px-4 py-3 bg-slate-900 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-white placeholder-slate-500 ${
                  errors.invoice_id ? 'border-red-500' : 'border-slate-700'
                }`}
              />
              {errors.invoice_id && (
                <p className="text-red-500 text-sm mt-1.5">
                  {errors.invoice_id.message}
                </p>
              )}
            </div>

            {/* Voucher */}
            <div>
              <label
                htmlFor="voucher"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                قسيمة خصم (اختياري)
              </label>
              <input
                {...register("voucher", { valueAsNumber: true })}
                type="number"
                id="voucher"
                step="0.01"
                min="0"
                placeholder="مثال: 10.00"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-white placeholder-slate-500"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label
                htmlFor="payment_method"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                طريقة الدفع
              </label>
              <select
                {...register("payment_method")}
                id="payment_method"
                className={`w-full px-4 py-3 bg-slate-900 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-white ${
                  errors.payment_method ? 'border-red-500' : 'border-slate-700'
                }`}
              >
                <option value="Credit Card">بطاقة ائتمان</option>
                <option value="Bank Transfer">تحويل بنكي</option>
                <option value="Cash">نقدي</option>
              </select>
              {errors.payment_method && (
                <p className="text-red-500 text-sm mt-1.5">
                  {errors.payment_method.message}
                </p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                العملة
              </label>
              <select
                {...register("currency")}
                id="currency"
                className={`w-full px-4 py-3 bg-slate-900 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-white ${
                  errors.currency ? 'border-red-500' : 'border-slate-700'
                }`}
              >
                <option value="USD">دولار أمريكي</option>
                <option value="EUR">يورو</option>
                 <option value="جنيه">جنيه مصري</option>
                <option value="GBP">جنيه إسترليني</option>
                <option value="JPY">ين ياباني</option>
              </select>
              {errors.currency && (
                <p className="text-red-500 text-sm mt-1.5">
                  {errors.currency.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Line Items Section */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <LineItemsInput
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            formState={formState}
          />
          {errors.invoice_items && (
            <p className="text-red-500 text-sm mt-4">
              {errors.invoice_items.message}
            </p>
          )}
        </section>

        {/* Notes Section */}
        {/* <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">
            ملاحظات الفاتورة
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أدخل معلومات إضافية للعميل"
            rows={3}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-white placeholder-slate-500 resize-none"
          />
        </section> */}

       

        {/* Pricing Summary Section */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6 flex-row-reverse">
            <h3 className="text-lg font-semibold text-white">
              ملخص الأسعار
            </h3>
            <div className="w-9 h-9 bg-green-600/20 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-500" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 flex-row-reverse">
              <span className="text-lg font-semibold text-white">
                {formatNumber(calculatedSubtotal)} {watch("currency")}
              </span>
              <span className="text-slate-400">
                المجموع الفرعي (محسوب)
              </span>
            </div>

            <div className="flex justify-between items-center py-2 flex-row-reverse">
              <div className="flex items-center gap-2">
                <input
                  {...register("subtotal", { valueAsNumber: true })}
                  readOnly
                  type="number"
                  id="subtotal"
                  className="w-36 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white text-right"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="tax" className="text-slate-400">
                  المجموع الفرعي اليدوي
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 flex-row-reverse">
              <div className="flex items-center gap-2">
                <input
                  {...register("tax", { valueAsNumber: true })}
                  type="number"
                  id="tax"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  className="w-36 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white text-right"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="tax" className="text-slate-400">
                  الضريبة
                </label>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4 flex justify-between items-center flex-row-reverse">
              <span className="text-2xl font-bold text-green-500">
                {formatNumber(calculatedTotal)} {watch("currency")}
              </span>
              <span className="text-xl font-bold text-white">الإجمالي</span>
            </div>
          </div>
        </section>

        

        {/* Send Button */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 ${
              isSubmitting
                ? "bg-slate-700 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                <span>جاري إنشاء الفاتورة...</span>
              </>
            ) : (
              <>
                <span>إنشاء الفاتورة</span>
                <Send className="w-5 h-5" />
              </>
            )}
          </button>

         
        </section>
      </form>
    </div>
  );
};
