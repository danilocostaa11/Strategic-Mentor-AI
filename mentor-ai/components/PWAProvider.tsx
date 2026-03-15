"use client";

import { useEffect, useState } from "react";
import { Download, X, WifiOff } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [showInstall, setShowInstall] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches
            || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
        let refreshTriggered = false;
        let updateInterval: number | null = null;

        const onControllerChange = () => {
            if (refreshTriggered) return;
            refreshTriggered = true;
            window.location.reload();
        };

        // Register Service Worker only in production and secure context
        if (
            "serviceWorker" in navigator
            && process.env.NODE_ENV === "production"
            && (window.isSecureContext || window.location.hostname === "localhost")
        ) {
            navigator.serviceWorker.register("/sw.js").then((reg) => {
                setRegistration(reg);

                if (reg.waiting) {
                    setShowUpdate(true);
                }

                reg.addEventListener("updatefound", () => {
                    const worker = reg.installing;
                    if (!worker) return;

                    worker.addEventListener("statechange", () => {
                        if (worker.state === "installed" && navigator.serviceWorker.controller) {
                            setShowUpdate(true);
                        }
                    });
                });

                navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

                updateInterval = window.setInterval(() => {
                    reg.update().catch(() => { });
                }, 60 * 60 * 1000);
            }).catch(() => { });
        }

        // Capture install prompt
        const handler = (e: Event) => {
            e.preventDefault();
            const promptEvent = e as BeforeInstallPromptEvent;
            setInstallPrompt(promptEvent);
            const dismissed = localStorage.getItem("pwa-install-dismissed");
            if (!dismissed && !isStandalone) setShowInstall(true);
        };
        window.addEventListener("beforeinstallprompt", handler);

        const onInstalled = () => {
            setShowInstall(false);
            setInstallPrompt(null);
        };
        window.addEventListener("appinstalled", onInstalled);

        // Offline detection
        const goOffline = () => setIsOffline(true);
        const goOnline = () => setIsOffline(false);
        window.addEventListener("offline", goOffline);
        window.addEventListener("online", goOnline);
        setIsOffline(!navigator.onLine);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("appinstalled", onInstalled);
            window.removeEventListener("offline", goOffline);
            window.removeEventListener("online", goOnline);
            navigator.serviceWorker?.removeEventListener?.("controllerchange", onControllerChange);
            if (updateInterval) {
                window.clearInterval(updateInterval);
            }
        };
    }, []);

    async function handleInstall() {
        if (!installPrompt) return;
        try {
            await installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            if (outcome === "accepted") {
                setShowInstall(false);
            }
        } finally {
            setInstallPrompt(null);
        }
    }

    function dismissInstall() {
        setShowInstall(false);
        localStorage.setItem("pwa-install-dismissed", "1");
    }

    function applyUpdate() {
        if (!registration?.waiting) return;
        setIsUpdating(true);
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
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
            {showInstall && installPrompt && (
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

            {showUpdate && (
                <div className="fixed bottom-6 right-6 z-[100] glass-card rounded-2xl p-4 shadow-2xl shadow-indigo-500/20 border border-indigo-500/30 max-w-sm w-[calc(100%-2rem)] sm:w-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <p className="text-sm font-semibold text-white mb-1">Nova versão disponível</p>
                    <p className="text-xs text-white/60 mb-3">
                        Atualize agora para usar a versão mais recente do Mentor AI.
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={applyUpdate}
                            disabled={isUpdating}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-medium hover:from-indigo-500 hover:to-cyan-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? "Atualizando..." : "Atualizar agora"}
                        </button>
                        <button
                            onClick={() => setShowUpdate(false)}
                            disabled={isUpdating}
                            className="px-3 py-2 rounded-lg border border-white/20 text-white/70 text-xs font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Depois
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
