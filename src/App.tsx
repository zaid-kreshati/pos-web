import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/Toast';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { CreateInvoicePage } from './pages/CreateInvoicePage';
import { InvoiceListPage } from './pages/InvoiceListPage';
import { PublicInvoicePage } from './pages/PublicInvoicePage';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// // Admin-only route component
// const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { isAuthenticated, user } = useAuth();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (user?.role !== 'admin') {
//     return <Navigate to="/invoices" replace />;
//   }

//   return <>{children}</>;
// };

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invoice/:uuid" element={<PublicInvoicePage />} />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <InvoiceListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-invoice"
        element={
          <ProtectedRoute>
            <CreateInvoicePage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/invoices" replace />} />
      <Route path="*" element={<Navigate to="/invoices" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToastContainer />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App
