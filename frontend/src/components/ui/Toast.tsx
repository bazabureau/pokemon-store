"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

interface ToastContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast["type"], title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => addToast("success", title, message), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast("error", title, message), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast("info", title, message), [addToast]);

  const iconMap = {
    success: <CheckCircle size={16} style={{ color: "var(--success)" }} />,
    error: <AlertCircle size={16} style={{ color: "var(--error)" }} />,
    info: <Info size={16} style={{ color: "var(--accent)" }} />,
  };

  const borderMap = {
    success: "var(--success)",
    error: "var(--error)",
    info: "var(--accent)",
  };

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[9998] flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: "380px", width: "100%" }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto animate-fade-in-up flex items-start gap-3 px-4 py-3"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderLeftWidth: "3px",
              borderLeftColor: borderMap[toast.type],
            }}
          >
            <div className="shrink-0 mt-0.5">{iconMap[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[12px] font-bold uppercase tracking-wider"
                style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}
              >
                {toast.title}
              </p>
              {toast.message && (
                <p
                  className="text-[11px] mt-0.5"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}
                >
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 transition-colors duration-100"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
