"use client";

import { useEffect, useState } from "react";
import { Download, X, Wifi, WifiOff } from "lucide-react";

export function PWAProvider({ children }: { children: React.ReactNode }) {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [showInstall, setShowInstall] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        // Register Service Worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch(() => { });
        }

        // Capture install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
            const dismissed = localStorage.getItem("pwa-install-dismissed");
            if (!dismissed) setShowInstall(true);
        };
        window.addEventListener("beforeinstallprompt", handler);

        // Offline detection
        const goOffline = () => setIsOffline(true);
        const goOnline = () => setIsOffline(false);
        window.addEventListener("offline", goOffline);
        window.addEventListener("online", goOnline);
        setIsOffline(!navigator.onLine);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("offline", goOffline);
            window.removeEventListener("online", goOnline);
        };
    }, []);

    async function handleInstall() {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === "accepted") {
            setShowInstall(false);
        }
        setInstallPrompt(null);
    }

    function dismissInstall() {
        setShowInstall(false);
        localStorage.setItem("pwa-install-dismissed", "1");
    }

    return (
        <>
            {children}

            {/* Offline Banner */}
            {isOffline && (
                <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-600/90 backdrop-blur-md text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
                    <WifiOff className="w-4 h-4" />
                    Você está offline. Algumas funcionalidades podem não estar disponíveis.
                </div>
            )}

            {/* Install Banner */}
            {showInstall && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] glass-card rounded-2xl p-5 shadow-2xl shadow-purple-500/20 border border-purple-500/30 max-w-sm w-[calc(100%-2rem)] animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <button
                        onClick={dismissInstall}
                        className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl shrink-0">
                            <Download className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white text-sm mb-1">Instalar Mentor AI</h3>
                            <p className="text-xs text-white/50 mb-3">
                                Acesse mais rápido direto da tela inicial do seu dispositivo.
                            </p>
                            <button
                                onClick={handleInstall}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer"
                            >
                                Instalar Agora
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
