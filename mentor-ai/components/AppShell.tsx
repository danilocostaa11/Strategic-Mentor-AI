"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    const syncViewport = (event?: MediaQueryListEvent) => {
      const matches = event?.matches ?? desktopQuery.matches;
      setIsDesktop(matches);
      if (matches) {
        setIsSidebarOpen(false);
      }
    };

    syncViewport();
    desktopQuery.addEventListener("change", syncViewport);

    return () => {
      desktopQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = !isDesktop && isSidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isDesktop, isSidebarOpen]);

  return (
    <div className="flex min-h-dvh overflow-hidden">
      {(isDesktop || isSidebarOpen) && (
        <Sidebar
          isDesktop={isDesktop}
          isOpen={isDesktop ? true : isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      {!isDesktop && isSidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className="relative flex min-h-dvh w-full flex-1 flex-col"
        style={isDesktop ? { marginLeft: "16rem" } : undefined}
      >
        <Topbar
          isDesktop={isDesktop}
          onMenuToggle={() => setIsSidebarOpen((current) => !current)}
        />
        <main className="relative flex-1 overflow-y-auto px-4 py-5 lg:p-8">
          <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent -z-10 pointer-events-none" />
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
