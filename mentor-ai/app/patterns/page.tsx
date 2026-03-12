"use client";

import { useEffect, useState } from "react";
import PatternsResult from "@/components/PatternsResult";

type Meeting = { id: string; title: string; createdAt: string; client?: { name: string } | null };

export default function PatternsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const selectedCount = Object.values(selected).filter(Boolean).length;

  useEffect(() => {
    fetch("/api/meetings")
      .then(r => r.json())
      .then((data) => setMeetings(data.filter((m: any) => m.status === "DONE")));
  }, []);

  async function run() {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (ids.length < 3) {
      alert("Selecione pelo menos 3 reuniões.");
      return;
    }
    setLoading(true);
    setReport(null);
    try {
      const r = await fetch("/api/patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingIds: ids }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Erro ao gerar padrões.");
      setReport(data);
    } catch (e: any) {
      alert(e.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold gradient-text">Análise de Padrões</h2>
        <p className="text-white/50 mt-1">Selecione pelo menos 3 reuniões para identificar padrões recorrentes.</p>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <span className="text-sm text-white/40">{selectedCount} reunião(ões) selecionada(s)</span>
        </div>
        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
          {meetings.map(m => (
            <label key={m.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={!!selected[m.id]}
                onChange={(e) => setSelected(s => ({ ...s, [m.id]: e.target.checked }))}
                className="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
              />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-white/90">{m.title}</span>
                {m.client?.name && (
                  <span className="text-white/40 ml-2">— {m.client.name}</span>
                )}
              </div>
              <span className="text-xs text-white/30 shrink-0">
                {new Date(m.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </label>
          ))}
          {meetings.length === 0 && (
            <div className="p-8 text-center text-white/40">
              Nenhuma reunião analisada encontrada.
            </div>
          )}
        </div>
      </div>

      <button
        onClick={run}
        disabled={loading || selectedCount < 3}
        className="mt-4 w-full py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/20"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span> Gerando padrões...
          </span>
        ) : (
          `Gerar Padrões (${selectedCount} selecionadas)`
        )}
      </button>

      {report && <PatternsResult report={report} />}
    </main>
  );
}
