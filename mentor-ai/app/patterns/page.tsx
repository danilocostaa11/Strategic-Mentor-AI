"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import PatternsResult from "@/components/PatternsResult";
import { showToast } from "@/components/Toast";

type Meeting = { id: string; title: string; createdAt: string; client?: { name: string } | null };

export default function PatternsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const selectedCount = Object.values(selected).filter(Boolean).length;

  useEffect(() => {
    fetch("/api/meetings")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => setMeetings(data.filter((m: any) => m.status === "DONE")))
      .catch(() => showToast("Erro ao carregar reuniões.", "error"))
      .finally(() => setLoadingList(false));
  }, []);

  async function run() {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (ids.length < 3) {
      showToast("Selecione pelo menos 3 reuniões.", "error");
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
      showToast("Relatório de padrões gerado!", "success");
    } catch (e: any) {
      showToast(e.message ?? "Erro ao gerar padrões.", "error");
    } finally {
      setLoading(false);
    }
  }

  function toggleSelectAll() {
    const allSelected = meetings.length > 0 && meetings.every(m => selected[m.id]);
    if (allSelected) {
      setSelected({});
    } else {
      const all: Record<string, boolean> = {};
      meetings.forEach(m => { all[m.id] = true; });
      setSelected(all);
    }
  }

  return (
    <main className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold gradient-text">Análise de Padrões</h2>
        <p className="text-white/50 mt-1">Selecione pelo menos 3 reuniões para identificar padrões recorrentes.</p>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-white/40">{selectedCount} reunião(ões) selecionada(s)</span>
          {meetings.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              {meetings.every(m => selected[m.id]) ? "Desmarcar todas" : "Selecionar todas"}
            </button>
          )}
        </div>
        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
          {loadingList ? (
            <div className="p-8 flex items-center justify-center text-white/40">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando reuniões...
            </div>
          ) : meetings.length === 0 ? (
            <div className="p-8 text-center text-white/40">
              Nenhuma reunião analisada encontrada.
            </div>
          ) : (
            meetings.map(m => (
              <label key={m.id} className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-white/[0.02] sm:items-center sm:px-5">
                <input
                  type="checkbox"
                  checked={!!selected[m.id]}
                  onChange={(e) => setSelected(s => ({ ...s, [m.id]: e.target.checked }))}
                  className="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                />
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-white/90">{m.title}</span>
                  {m.client?.name && (
                    <span className="mt-0.5 block text-sm text-white/40 sm:ml-2 sm:mt-0 sm:inline">— {m.client.name}</span>
                  )}
                </div>
                <span className="shrink-0 pt-0.5 text-xs text-white/30">
                  {new Date(m.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </label>
            ))
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
            <Loader2 className="w-4 h-4 animate-spin" /> Gerando padrões...
          </span>
        ) : (
          `Gerar Padrões (${selectedCount} selecionadas)`
        )}
      </button>

      {report && <PatternsResult report={report} />}
    </main>
  );
}
