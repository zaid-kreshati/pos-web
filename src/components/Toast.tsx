import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const bgColor =
          toast.type === 'success'
            ? 'bg-green-50 border-green-200'
            : toast.type === 'error'
              ? 'bg-red-50 border-red-200'
              : 'bg-blue-50 border-blue-200';

        const textColor =
          toast.type === 'success'
            ? 'text-green-800'
            : toast.type === 'error'
              ? 'text-red-800'
              : 'text-blue-800';

        const iconColor =
          toast.type === 'success'
            ? 'text-green-600'
            : toast.type === 'error'
              ? 'text-red-600'
              : 'text-blue-600';

        const Icon =
          toast.type === 'success'
            ? CheckCircle
            : toast.type === 'error'
              ? AlertCircle
              : Info;

        return (
          <div
            key={toast.id}
            className={`border rounded-lg p-4 flex items-start gap-3 max-w-sm shadow-lg ${bgColor}`}
          >
            <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <p className={`text-sm font-medium ${textColor}`}>{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className={`ml-auto flex-shrink-0 text-lg ${textColor} hover:opacity-70`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
