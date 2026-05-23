"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { showToast } from "@/components/Toast";
import {
  Users,
  Plus,
  User,
  Building2,
  BrainCircuit,
  Trash2,
  Edit3,
  Save,
  Check,
  FileText,
  Calendar,
  ExternalLink,
  ChevronDown,
  X,
  Loader2,
  Award,
} from "lucide-react";

type MeetingSummary = {
  id: string;
  title: string;
  strategicScore: number | null;
  closingScore: number | null;
  createdAt: string;
};

type Client = {
  id: string;
  name: string;
  company?: string | null;
  segment?: string | null;
  profileManual?: string | null;
  profileAI?: string | null;
  profileConfirmed: boolean;
  notes?: string | null;
  meetings: MeetingSummary[];
  createdAt: string;
};

const DISC_COLORS: Record<string, string> = {
  "Analítico": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Integrador": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Expressivo": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Pragmático": "bg-red-500/20 text-red-400 border-red-500/30",
  "Indefinido": "bg-white/10 text-white/50 border-white/10",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Create client form state
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [segment, setSegment] = useState("Pharma");
  const [profileManual, setProfileManual] = useState("Analítico");
  const [saving, setSaving] = useState(false);

  // Accordion and Interaction state
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editSegment, setEditSegment] = useState("");
  const [editProfileManual, setEditProfileManual] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDiscSelection, setEditDiscSelection] = useState("");
  const [isNotesSaving, setIsNotesSaving] = useState(false);
  const [isDiscVerifying, setIsDiscVerifying] = useState(false);

  async function refresh() {
    try {
      const r = await fetch("/api/clients");
      if (!r.ok) throw new Error();
      const data = await r.json();
      setClients(data);
    } catch {
      showToast("Erro ao carregar clientes.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

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

  // Handle accordion toggle
  const handleToggleExpand = (client: Client) => {
    if (editingClientId) return; // Disable expanding while editing
    if (expandedClientId === client.id) {
      setExpandedClientId(null);
    } else {
      setExpandedClientId(client.id);
      setEditNotes(client.notes ?? "");
      setEditDiscSelection(client.profileAI || client.profileManual || "Analítico");
    }
  };

  // Start Inline Editing
  const startEditing = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClientId(client.id);
    setEditName(client.name);
    setEditCompany(client.company ?? "");
    setEditSegment(client.segment ?? "Pharma");
    setEditProfileManual(client.profileManual ?? "Analítico");
  };

  // Save Inline Editing
  const saveClient = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/clients?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          company: editCompany || null,
          segment: editSegment || null,
          profileManual: editProfileManual || null,
        }),
      });
      if (!r.ok) throw new Error();
      showToast("Cliente atualizado com sucesso!", "success");
      setEditingClientId(null);
      await refresh();
    } catch {
      showToast("Erro ao atualizar cliente.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Save Notes
  const saveClientNotes = async (id: string) => {
    setIsNotesSaving(true);
    try {
      const r = await fetch(`/api/clients?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNotes }),
      });
      if (!r.ok) throw new Error();
      showToast("Notas salvas!", "success");
      // Update local client notes
      setClients(prev => prev.map(c => c.id === id ? { ...c, notes: editNotes } : c));
    } catch {
      showToast("Erro ao salvar notas.", "error");
    } finally {
      setIsNotesSaving(false);
    }
  };

  // Confirm/Verify DISC Profile
  const verifyDiscProfile = async (client: Client, selectedDisc?: string) => {
    setIsDiscVerifying(true);
    const discToConfirm = selectedDisc || client.profileAI || client.profileManual || "Analítico";
    try {
      const r = await fetch(`/api/clients?id=${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileConfirmed: true,
          profileAI: discToConfirm,
        }),
      });
      if (!r.ok) throw new Error();
      showToast(`Perfil DISC "${discToConfirm}" verificado!`, "success");
      await refresh();
    } catch {
      showToast("Erro ao verificar perfil DISC.", "error");
    } finally {
      setIsDiscVerifying(false);
    }
  };

  // Delete Client
  const deleteClient = async (id: string, name: string) => {
    setDeletingClientId(id);
    try {
      const r = await fetch(`/api/clients?id=${id}`, {
        method: "DELETE",
      });
      if (!r.ok) {
        const errData = await r.json();
        throw new Error(errData.error || "Erro ao excluir.");
      }
      showToast(`Cliente "${name}" excluído.`, "success");
      setExpandedClientId(null);
      await refresh();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setDeletingClientId(null);
    }
  };

  return (
    <main className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Clientes</h2>
          <p className="text-white/40 text-sm mt-1">
            {loading ? "Carregando clientes..." : `${clients.length} cliente(s) cadastrado(s)`}
          </p>
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
                <option value="Indefinido">❓ Indefinido</option>
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

      {/* Main Content Area */}
      {loading ? (
        <div className="glass-card rounded-xl p-12 text-center text-white/40 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <span>Carregando seus mentores e clientes...</span>
        </div>
      ) : clients.length === 0 ? (
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
            {clients.map((c) => {
              const disc = c.profileAI || c.profileManual || "Indefinido";
              const discColor = DISC_COLORS[disc] || "bg-white/10 text-white/50 border-white/10";
              const isExpanded = expandedClientId === c.id;
              const isEditing = editingClientId === c.id;
              const isDeleting = deletingClientId === c.id;

              return (
                <div
                  key={c.id}
                  className={`flex flex-col transition-all ${
                    isExpanded ? "bg-white/[0.03]" : "hover:bg-white/[0.01]"
                  } ${isDeleting ? "opacity-30 pointer-events-none" : ""}`}
                >
                  {/* Row Header */}
                  <div
                    onClick={() => handleToggleExpand(c)}
                    className="flex items-start gap-3 px-4 py-5 cursor-pointer sm:items-center sm:gap-4 sm:px-6 select-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/20">
                      <span className="text-sm font-bold text-white">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-1" onClick={e => e.stopPropagation()}>
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 text-sm rounded bg-white/10 border border-white/20 text-white outline-none focus:border-purple-500"
                            placeholder="Nome *"
                          />
                          <input
                            value={editCompany}
                            onChange={(e) => setEditCompany(e.target.value)}
                            className="px-2 py-1 text-sm rounded bg-white/10 border border-white/20 text-white outline-none focus:border-purple-500"
                            placeholder="Empresa"
                          />
                          <select
                            title="Segmento"
                            value={editSegment}
                            onChange={(e) => setEditSegment(e.target.value)}
                            className="px-2 py-1 text-sm rounded bg-white/10 border border-white/20 text-white outline-none focus:border-purple-500"
                          >
                            <option value="Pharma">🧪 Pharma</option>
                            <option value="Imob">🏠 Imob</option>
                            <option value="IA">🤖 IA / B2B</option>
                          </select>
                          <select
                            title="DISC Manual"
                            value={editProfileManual}
                            onChange={(e) => setEditProfileManual(e.target.value)}
                            className="px-2 py-1 text-sm rounded bg-white/10 border border-white/20 text-white outline-none focus:border-purple-500"
                          >
                            <option value="Analítico">🔍 Analítico</option>
                            <option value="Integrador">🤝 Integrador</option>
                            <option value="Expressivo">🎭 Expressivo</option>
                            <option value="Pragmático">⚡ Pragmático</option>
                            <option value="Indefinido">❓ Indefinido</option>
                          </select>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white/90 text-sm sm:text-base transition-colors group-hover:text-purple-300">
                              {c.name}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${discColor} flex items-center gap-1.5 transition-all duration-300 ${
                                c.profileConfirmed
                                  ? "shadow-[0_0_10px_rgba(16,185,129,0.15)] border-emerald-500/50"
                                  : ""
                              }`}
                            >
                              {disc}
                              {c.profileConfirmed && (
                                <span className="flex items-center justify-center w-3 h-3 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                                  <Check className="w-2 h-2 stroke-[3px]" />
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                            {c.company && (
                              <span className="flex items-center gap-1 font-medium">
                                <Building2 className="w-3.5 h-3.5 text-white/30" /> {c.company}
                              </span>
                            )}
                            {c.segment && (
                              <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider">
                                {c.segment}
                              </span>
                            )}
                            <span className="text-[10px]">
                              {c.meetings.length} reunião(ões)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions and Chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => saveClient(c.id, e)}
                            disabled={saving}
                            className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition"
                            title="Salvar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingClientId(null); }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => startEditing(c, e)}
                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition"
                            title="Editar dados básicos"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <ChevronDown
                            className={`w-5 h-5 text-white/30 transition-transform duration-300 ${
                              isExpanded ? "rotate-180 text-purple-400" : ""
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row Body Accordion (Using smooth grid-template-rows expansion) */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isExpanded ? "opacity-100 border-t border-white/5" : "opacity-0"
                    }`}
                    style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="p-4 sm:p-6 space-y-6">
                        {/* Upper Section: DISC Verification & Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Left Block: DISC Status & Verify Profile */}
                          <div className="glass-card p-5 rounded-xl border border-white/5 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-4">
                                <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
                                  <BrainCircuit className="w-4 h-4 text-purple-400" /> Perfil de Comunicação (DISC)
                                </h4>
                                {c.profileConfirmed && (
                                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold shadow-[0_0_8px_rgba(16,185,129,0.15)] animate-pulse">
                                    Verificado ✓
                                  </span>
                                )}
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-white/40">Perfil Atual:</span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${discColor} shadow-sm`}>
                                    {disc}
                                  </span>
                                </div>

                                <p className="text-xs text-white/50 leading-relaxed">
                                  O perfil DISC define o estilo de tomada de decisão e a linguagem ideal para este cliente. Calibrar e confirmar o perfil melhora drasticamente a precisão das futuras mentorias e negociações.
                                </p>
                              </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-3">
                              <label className="block text-xs font-medium text-white/60">Calibrar e Confirmar Perfil</label>
                              <div className="w-full flex flex-col sm:flex-row gap-2 items-center">
                                <div className="flex-1 w-full">
                                  <select
                                    title="Selecionar Perfil DISC"
                                    value={editDiscSelection}
                                    onChange={(e) => setEditDiscSelection(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500 transition-all"
                                  >
                                    <option value="Analítico">🔍 Analítico</option>
                                    <option value="Integrador">🤝 Integrador</option>
                                    <option value="Expressivo">🎭 Expressivo</option>
                                    <option value="Pragmático">⚡ Pragmático</option>
                                    <option value="Indefinido">❓ Indefinido</option>
                                  </select>
                                </div>
                                <button
                                  onClick={() => verifyDiscProfile(c, editDiscSelection)}
                                  disabled={isDiscVerifying}
                                  className={`w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 disabled:opacity-40 ${
                                    c.profileConfirmed && editDiscSelection === disc
                                      ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/10"
                                  }`}
                                >
                                  {isDiscVerifying ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : c.profileConfirmed && editDiscSelection === disc ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3px]" />
                                  ) : (
                                    <BrainCircuit className="w-3.5 h-3.5" />
                                  )}
                                  {c.profileConfirmed && editDiscSelection === disc ? "Confirmado ✓" : "Confirmar Perfil"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Right Block: Notes */}
                          <div className="glass-card p-5 rounded-xl border border-white/5 flex flex-col">
                            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2 mb-3">
                              <FileText className="w-4 h-4 text-purple-400" /> Bloco de Notas do Cliente
                            </h4>
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Adicione observações importantes sobre esse cliente (ex: objetivos de longo prazo, gatilhos de decisão, particularidades, etc.)..."
                              rows={4}
                              className="w-full flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/20 text-xs sm:text-sm resize-none focus:border-purple-500/50 outline-none transition"
                            />
                            <div className="mt-3 flex justify-end">
                              <button
                                onClick={() => saveClientNotes(c.id)}
                                disabled={isNotesSaving}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-40"
                              >
                                {isNotesSaving ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Save className="w-3.5 h-3.5" />
                                )}
                                Salvar Notas
                              </button>
                            </div>
                          </div>

                        </div>

                        {/* Lower Section: Meetings History */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> Histórico de Reuniões
                            </h4>
                            <Link
                              href={`/meetings/new?clientId=${c.id}`}
                              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition"
                            >
                              <Plus className="w-3 h-3" /> Nova Reunião
                            </Link>
                          </div>

                          {c.meetings.length === 0 ? (
                            <div className="p-6 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center text-white/30 text-xs">
                              Nenhuma reunião analisada vinculada a este cliente.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {c.meetings.map((m) => (
                                <Link
                                  key={m.id}
                                  href={`/meetings/${m.id}`}
                                  className="group flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-purple-500/20 transition"
                                >
                                  <div className="min-w-0 flex-1 pr-2">
                                    <p className="text-xs text-white/80 font-medium truncate group-hover:text-purple-300 transition-colors">
                                      {m.title}
                                    </p>
                                    <p className="text-[10px] text-white/30 mt-0.5">
                                      {new Date(m.createdAt).toLocaleDateString("pt-BR")}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-white/50">
                                      {m.strategicScore !== null && (
                                        <span>E: <span className="text-purple-400 font-bold">{m.strategicScore}</span></span>
                                      )}
                                      {m.closingScore !== null && (
                                        <span>F: <span className="text-blue-400 font-bold">{m.closingScore}</span></span>
                                      )}
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Danger Zone */}
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="text-xs text-white/20">
                            Cadastrado em {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                          </div>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir permanentemente o cliente "${c.name}"?\n\nIsso removerá apenas o registro do cliente.`)) {
                                deleteClient(c.id, c.name);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir Cliente
                          </button>
                        </div>

                      </div>
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
