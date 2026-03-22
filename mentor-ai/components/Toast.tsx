"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastData {
    id: number;
    message: string;
    type: ToastType;
}

let toastId = 0;
let addToastFn: ((message: string, type: ToastType) => void) | null = null;

// Global toast trigger
export function showToast(message: string, type: ToastType = "success") {
    addToastFn?.(message, type);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    useEffect(() => {
        addToastFn = (message: string, type: ToastType) => {
            const id = ++toastId;
            setToasts(prev => [...prev, { id, message, type }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 4000);
        };
        return () => { addToastFn = null; };
    }, []);

    function dismiss(id: number) {
        setToasts(prev => prev.filter(t => t.id !== id));
    }

    const icons: Record<ToastType, React.ReactNode> = {
        success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
    };

    const borders: Record<ToastType, string> = {
        success: "border-emerald-500/30",
        error: "border-red-500/30",
        info: "border-blue-500/30",
    };

    return (
        <>
            {children}
            <div className="pointer-events-none fixed left-4 right-4 top-20 z-[90] space-y-3 sm:left-auto sm:right-6">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`glass-card pointer-events-auto flex w-full items-center gap-3 rounded-xl border p-4 shadow-xl animate-in fade-in slide-in-from-right duration-300 sm:min-w-[280px] sm:max-w-[380px] ${borders[t.type]}`}
                    >
                        {icons[t.type]}
                        <span className="text-sm text-white/90 flex-1">{t.message}</span>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="text-white/30 hover:text-white transition-colors cursor-pointer shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}
