import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(null);

/** React version of showNotification(message, type) from shared.js */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const showNotification = useCallback((message, type = 'success') => {
    clearTimers();
    setToast({ id: Date.now(), message, type, leaving: false });
    timers.current.push(
      setTimeout(() => setToast((t) => (t ? { ...t, leaving: true } : t)), 3000),
      setTimeout(() => setToast(null), 3300)
    );
  }, []);

  useEffect(() => clearTimers, []);

  return (
    <ToastContext.Provider value={{ showNotification }}>
      {children}
      {toast && (
        <div
          key={toast.id}
          className={`bluely-notification ${toast.type}${toast.leaving ? ' leaving' : ''}`}
          role="status"
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
