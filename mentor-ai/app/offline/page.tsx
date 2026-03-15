"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="min-h-[70vh] w-full flex items-center justify-center p-6">
      <section className="max-w-lg w-full glass-card border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-3">Modo Offline</p>
        <h1 className="text-2xl font-semibold text-white mb-3">Sem conexão com a internet</h1>
        <p className="text-sm text-white/65 mb-6">
          Você está offline no momento. Reabra páginas já visitadas ou tente novamente quando a conexão voltar.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer"
          >
            Tentar novamente
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Ir para dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
