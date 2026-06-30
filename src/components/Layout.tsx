import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Wallet, LayoutDashboard, FileText, Users, Settings, Bell, Menu, X, ChevronLeft, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/invoices/all-full', label: 'الفواتير', icon: FileText },
    { path: '/create-invoice', label: 'إنشاء فاتورة', icon: Plus },
    { path: '/clients', label: 'العملاء', icon: Users },
    { path: '/settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed right-0 top-0 h-full w-64 bg-slate-800 text-white z-50 transform transition-transform duration-300 lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 flex-row-reverse">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">إنفويسلي</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition flex-row-reverse
                    ${isActive 
                      ? 'bg-green-600 text-white' 
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info at Bottom */}
        <div className="absolute bottom-0 right-0 left-0 p-6 border-t border-slate-700">
          {user && (
            <div className="flex items-center gap-3 mb-4 flex-row-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-medium truncate text-white">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-700 hover:text-white transition flex-row-reverse"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:mr-64 min-h-screen">
        {/* Top Header */}
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-row-reverse">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-slate-400" />}
                </button>
                {/* Back Button */}
                <button
                  onClick={() => navigate(-1)}
                  className="hidden lg:flex items-center justify-center w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-400 rotate-180" />
                </button>
                {/* Logo (Mobile Only) */}
                <div className="flex items-center gap-2 lg:hidden">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-white">إنفويسلي</span>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-row-reverse">
                <button className="p-2 hover:bg-slate-800 rounded-lg transition relative">
                  <Bell className="w-6 h-6 text-slate-400" />
                  <span className="absolute top-1 left-1 w-2 h-2 bg-green-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-30">
          <div className="flex items-center justify-around py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition
                    ${isActive 
                      ? 'text-green-500' 
                      : 'text-slate-500 hover:text-slate-400'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};