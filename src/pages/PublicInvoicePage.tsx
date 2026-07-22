import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublicInvoice } from '../api/invoiceApi';
import type { Invoice } from '../types/api';
import { formatNumber } from '../utils/formatters';

export const PublicInvoicePage: React.FC = () => {
  const { uuid = '' } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) return;
    getPublicInvoice(uuid)
      .then((response) => setInvoice(response.data ?? null))
      .catch((reason) => setError(reason?.message || 'تعذّر العثور على الفاتورة.'));
  }, [uuid]);

  if (error) return <ReceiptShell><p className="text-red-400">{error}</p></ReceiptShell>;
  if (!invoice) return <ReceiptShell><p className="text-slate-400">جارِ تحميل الفاتورة…</p></ReceiptShell>;

  return (
    <ReceiptShell>
      <div className="flex justify-between gap-4 border-b border-slate-700 pb-5 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">{invoice.store?.name || 'الإيصال الإلكتروني'}</h1>
          <p className="text-slate-400 mt-1">{invoice.branch?.name}</p>
        </div>
        <div className="text-left text-sm text-slate-400">
          <div>رقم الفاتورة: {invoice.external_invoice_id}</div>
          <div className="font-mono text-xs mt-1">{invoice.uuid}</div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {invoice.items?.map((item, index) => (
          <div className="flex justify-between gap-4 text-slate-200" key={`${item.product_name}-${index}`}>
            <span>{item.product_name || 'منتج'} <span className="text-slate-500">× {item.quantity}</span></span>
            <span>{formatNumber(item.total)} {invoice.currency}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-700 pt-4 space-y-2 text-slate-300">
        <div className="flex justify-between"><span>الإجمالي الفرعي</span><span>{formatNumber(invoice.subtotal)} {invoice.currency}</span></div>
        <div className="flex justify-between"><span>الضريبة</span><span>{formatNumber(invoice.tax)} {invoice.currency}</span></div>
        <div className="flex justify-between text-xl font-bold text-white mt-3"><span>الإجمالي</span><span>{formatNumber(invoice.total)} {invoice.currency}</span></div>
      </div>
    </ReceiptShell>
  );
};

const ReceiptShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <main dir="rtl" className="min-h-screen bg-slate-950 p-4 sm:p-8">
    <section className="max-w-xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">{children}</section>
    <p className="text-center text-xs text-slate-600 mt-5"><Link to="/">NFC Invoice</Link></p>
  </main>
);
