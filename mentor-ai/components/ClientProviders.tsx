"use client";

import { useEffect, useState } from "react";
import { PWAProvider } from "@/components/PWAProvider";
import { ToastProvider } from "@/components/Toast";
import Onboarding from "@/components/Onboarding";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const done = localStorage.getItem("onboarding-done");
        if (!done) setShowOnboarding(true);
    }, []);

    if (!mounted) return <>{children}</>;

    if (showOnboarding) {
        return <Onboarding />;
    }

    return (
        <PWAProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </PWAProvider>
    );
}
