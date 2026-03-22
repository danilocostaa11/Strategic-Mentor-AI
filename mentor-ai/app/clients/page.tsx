"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";
import { Users, Plus, User, Building2, BrainCircuit } from "lucide-react";

type Client = {
  id: string;
  name: string;
  company?: string | null;
  segment?: string | null;
  profileManual?: string | null;
  profileAI?: string | null;
  profileConfirmed?: boolean;
  _count?: { meetings: number };
};

const DISC_COLORS: Record<string, string> = {
  "Analítico": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Integrador": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Expressivo": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Pragmático": "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [segment, setSegment] = useState("Pharma");
  const [profileManual, setProfileManual] = useState("Analítico");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try {
      const r = await fetch("/api/clients");
      if (!r.ok) throw new Error();
      setClients(await r.json());
    } catch {
      showToast("Erro ao carregar clientes.", "error");
    }
  }

  useEffect(() => { refresh(); }, []);

  async function createClient() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const r = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company, segment, profileManual }),
      });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data?.error ?? "Erro ao criar cliente.");
      }
      setName("");
      setCompany("");
      setShowForm(false);
      showToast(`Cliente "${name}" cadastrado!`, "success");
      await refresh();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Clientes</h2>
          <p className="text-white/40 text-sm mt-1">{clients.length} cliente(s) cadastrado(s)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-purple-500/20 transition-all cursor-pointer hover:bg-purple-500 sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card mb-6 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" /> Cadastrar Cliente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Nome *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Dr. Eduardo Silva"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Empresa (opcional)</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ex: Clínica MedPlus"
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Segmento</label>
              <select
                title="Segmento do cliente"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50 outline-none transition-all"
              >
                <option value="Pharma">🧪 Pharma</option>
                <option value="Imob">🏠 Imob</option>
                <option value="IA">🤖 IA / B2B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Perfil DISC (manual)</label>
              <select
                title="Perfil DISC manual"
                value={profileManual}
                onChange={(e) => setProfileManual(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50 outline-none transition-all"
              >
                <option value="Analítico">🔍 Analítico</option>
                <option value="Integrador">🤝 Integrador</option>
                <option value="Expressivo">🎭 Expressivo</option>
                <option value="Pragmático">⚡ Pragmático</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={createClient}
              disabled={!name.trim() || saving}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer disabled:opacity-40"
            >
              {saving ? "Salvando..." : "Cadastrar"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {clients.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-white mb-2">Nenhum cliente cadastrado</h3>
          <p className="text-sm text-white/40 mb-6">Cadastre seus clientes para vincular às análises de reuniões.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Cadastrar Primeiro Cliente
          </button>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {clients.map(c => {
              const disc = c.profileAI || c.profileManual;
              const discColor = DISC_COLORS[disc || ""] || "bg-white/10 text-white/50 border-white/10";
              return (
                <div key={c.id} className="flex items-start gap-3 px-4 py-4 transition-all hover:bg-white/[0.02] sm:items-center sm:gap-4 sm:px-5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">{c.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white/90 truncate">{c.name}</span>
                      {disc && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${discColor}`}>
                          {disc}
                          {c.profileConfirmed && " ✓"}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                      {c.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {c.company}
                        </span>
                      )}
                      {c.segment && <span>{c.segment}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
