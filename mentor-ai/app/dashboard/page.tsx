"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, ExternalLink, Search, Filter, X, Loader2 } from "lucide-react";
import { showToast } from "@/components/Toast";

type Meeting = {
  id: string;
  title: string;
  segment?: string | null;
  status?: string;
  strategicScore?: number | null;
  closingScore?: number | null;
  listeningScore?: number | null;
  dealOutcome?: string | null;
  createdAt: string;
  client?: { id: string; name: string } | null;
};

function ScoreBadge({ value, label }: { value: number | null | undefined; label: string }) {
  if (value == null) return <span className="text-xs text-white/20">{label}: —</span>;
  const color =
    value >= 8 ? "text-emerald-400" :
      value >= 6 ? "text-blue-400" :
        value >= 4 ? "text-amber-400" : "text-red-400";

  return (
    <span className="text-xs text-white/50">
      {label}: <span className={`font-bold ${color}`}>{value}</span>
    </span>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const config: Record<string, { color: string; label: string }> = {
    DONE: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "Concluída" },
    ANALYZING: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Analisando" },
    PENDING: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Pendente" },
    ERROR: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Erro" },
  };
  const c = config[status || "DONE"] || config.DONE;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${c.color}`}>
      {c.label}
    </span>
  );
}

function OutcomeBadge({ outcome }: { outcome?: string | null }) {
  if (!outcome) return null;
  const config: Record<string, { color: string; label: string }> = {
    GANHOU: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "🏆 Ganhou" },
    PERDEU: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "❌ Perdeu" },
    EM_ANDAMENTO: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "⏳ Em Andamento" },
  };
  const c = config[outcome];
  if (!c) return null;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${c.color}`}>
      {c.label}
    </span>
  );
}

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterClient, setFilterClient] = useState("");
  const [filterSegment, setFilterSegment] = useState("");
  const [filterOutcome, setFilterOutcome] = useState("");
  const [filterScoreMin, setFilterScoreMin] = useState("");
  const [filterScoreMax, setFilterScoreMax] = useState("");

  useEffect(() => {
    fetch("/api/meetings")
      .then(r => { if (!r.ok) throw new Error("Falha ao carregar"); return r.json(); })
      .then(setMeetings)
      .catch(() => showToast("Erro ao carregar reuniões.", "error"))
      .finally(() => setLoading(false));
  }, []);

  // Extract unique values for dropdowns
  const uniqueClients = [...new Map(meetings.filter(m => m.client).map(m => [m.client!.id, m.client!.name])).entries()];
  const uniqueSegments = [...new Set(meetings.map(m => m.segment).filter(Boolean))];

  const hasActiveFilters = filterClient || filterSegment || filterOutcome || filterScoreMin || filterScoreMax;

  const filtered = meetings.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.title.toLowerCase().includes(q) || m.client?.name?.toLowerCase().includes(q) || m.segment?.toLowerCase().includes(q);
    const matchClient = !filterClient || m.client?.id === filterClient;
    const matchSegment = !filterSegment || m.segment === filterSegment;
    const matchOutcome = !filterOutcome || m.dealOutcome === filterOutcome;
    const score = m.strategicScore ?? 0;
    const matchScoreMin = !filterScoreMin || score >= Number(filterScoreMin);
    const matchScoreMax = !filterScoreMax || score <= Number(filterScoreMax);

    return matchSearch && matchClient && matchSegment && matchOutcome && matchScoreMin && matchScoreMax;
  });

  function clearFilters() {
    setFilterClient("");
    setFilterSegment("");
    setFilterOutcome("");
    setFilterScoreMin("");
    setFilterScoreMax("");
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Tem certeza que deseja excluir "${title}"?\n\nEsta ação não pode ser desfeita.`)) return;
    setDeleting(id);
    try {
      const r = await fetch(`/api/meetings?id=${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Erro ao excluir.");
      setMeetings(prev => prev.filter(m => m.id !== id));
    } catch (e: any) {
      showToast(e.message ?? "Erro ao excluir reunião.", "error");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <main className="max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Histórico de Reuniões</h2>
          <p className="text-white/40 text-sm mt-1">
            {filtered.length} de {meetings.length} reunião(ões)
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 sm:w-48"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${showFilters || hasActiveFilters
                ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
              }`}
            title="Filtros"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="glass-card rounded-xl p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white/50">Filtros Avançados</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" /> Limpar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
            <div>
              <label className="text-xs text-white/30 block mb-1">Cliente</label>
              <select
                title="Filtrar por cliente"
                value={filterClient}
                onChange={e => setFilterClient(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none"
              >
                <option value="">Todos</option>
                {uniqueClients.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/30 block mb-1">Segmento</label>
              <select
                title="Filtrar por segmento"
                value={filterSegment}
                onChange={e => setFilterSegment(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none"
              >
                <option value="">Todos</option>
                {uniqueSegments.map(s => (
                  <option key={s} value={s!}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/30 block mb-1">Resultado</label>
              <select
                title="Filtrar por resultado"
                value={filterOutcome}
                onChange={e => setFilterOutcome(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none"
              >
                <option value="">Todos</option>
                <option value="GANHOU">🏆 Ganhou</option>
                <option value="PERDEU">❌ Perdeu</option>
                <option value="EM_ANDAMENTO">⏳ Em Andamento</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/30 block mb-1">Score mín.</label>
              <input
                type="number"
                min="0"
                max="10"
                value={filterScoreMin}
                onChange={e => setFilterScoreMin(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs text-white/30 block mb-1">Score máx.</label>
              <input
                type="number"
                min="0"
                max="10"
                value={filterScoreMax}
                onChange={e => setFilterScoreMax(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none"
                placeholder="10"
              />
            </div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center text-white/40">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando reuniões...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-white/40">
            {search || hasActiveFilters ? "Nenhuma reunião encontrada com esses filtros." : "Nenhuma reunião registrada ainda."}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(m => (
              <div
                key={m.id}
                className={`group flex flex-col gap-3 px-4 py-4 transition-all hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-4 sm:px-5 ${deleting === m.id ? "opacity-40 pointer-events-none" : ""
                  }`}
              >
                <div className="flex items-start gap-3 sm:min-w-0 sm:flex-1">
                  <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${m.status === "DONE" ? "bg-emerald-400" :
                      m.status === "ERROR" ? "bg-red-400" :
                        m.status === "ANALYZING" ? "bg-blue-400 animate-pulse" : "bg-amber-400"
                    }`} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-white/90">{m.title}</span>
                      <StatusBadge status={m.status} />
                      <OutcomeBadge outcome={m.dealOutcome} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                      {m.client?.name && <span className="text-purple-400">{m.client.name}</span>}
                      {m.segment && <span>{m.segment}</span>}
                      <span>{new Date(m.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 sm:shrink-0 sm:flex-nowrap sm:justify-end">
                  <div className="flex flex-col gap-0.5 sm:items-end">
                    <ScoreBadge value={m.strategicScore} label="Estratégia" />
                    <ScoreBadge value={m.closingScore} label="Fechamento" />
                    <ScoreBadge value={m.listeningScore} label="Escuta" />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/meetings/${m.id}`}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                      title="Ver análise"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(m.id, m.title)}
                      disabled={deleting === m.id}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all cursor-pointer"
                      title="Excluir reunião"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
