import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto shadow-lg flex items-center px-4 py-3 min-w-[250px]"
            style={{
              background: 'var(--surface)',
              border: `1px solid ${
                toast.type === 'success' ? 'var(--green-dim)' : 
                toast.type === 'warning' ? 'rgba(245, 166, 35, 0.2)' : 
                toast.type === 'error' ? 'var(--red)' : 'var(--border)'
              }`,
              borderLeftWidth: '4px',
              borderLeftColor: 
                toast.type === 'success' ? 'var(--green)' : 
                toast.type === 'warning' ? 'var(--amber)' : 
                toast.type === 'error' ? 'var(--red)' : 'var(--accent)',
              borderRadius: 'var(--radius-sm)',
              animation: 'slide-in-right 0.2s ease forwards'
            }}
          >
            <span style={{ color: 'var(--text)', fontWeight: 500 }}>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
