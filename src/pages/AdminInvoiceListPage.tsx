import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { getAllInvoices } from '../api/invoiceApi';
import type { Invoice } from '../types/api';
import { Search, FileText, Store, User, Calendar } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

export const AdminInvoiceListPage: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async (page = 1, searchTerm = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllInvoices({
        search: searchTerm,
        page,
        per_page: 10,
      });
      if (response.data) {
        setInvoices(response.data.data);
        setLastPage(response.data.last_page);
        setCurrentPage(response.data.current_page);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInvoices(1, search);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > lastPage) return;
    fetchInvoices(page, search);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">جميع الفواتير</h1>
          <p className="text-slate-500 text-sm">إدارة جميع الفواتير في النظام</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن فاتورة برقمها أو اسم المتجر..."
              className="w-full pr-12 pl-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 rounded-xl p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Invoices List */}
        {!loading && !error && (
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد فواتير</h3>
                <p className="text-slate-500">لم يتم إضافة أي فواتير بعد</p>
              </div>
            ) : (
              <>
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="text-right">
                          <h3 className="text-lg font-semibold text-white">{invoice.external_invoice_id}</h3>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {invoice.store && (
                              <div className="flex items-center gap-1">
                                <Store className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-400 text-sm">{invoice.store.name}</span>
                              </div>
                            )}
                            {invoice.user && (
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-400 text-sm">{invoice.user.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold text-green-500">
                          {formatNumber(invoice.total)} {invoice.currency}
                        </div>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-500 text-sm">
                            {new Date(invoice.created_at).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <span>السابق</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                        let pageNum: number;
                        if (lastPage <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= lastPage - 2) {
                          pageNum = lastPage - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-xl font-semibold transition ${
                              currentPage === pageNum
                                ? 'bg-green-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === lastPage || loading}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <span>التالي</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};
