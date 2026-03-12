"use client";

import { useState } from "react";
import { Check, Edit3, Download, MessageSquare, Trophy } from "lucide-react";

interface FeedbackPanelProps {
    meetingId: string;
    profiles?: { participant: string; disc: string; confidence: number; evidence: string[] }[];
    currentOutcome?: string | null;
}

const DISC_OPTIONS = ["Analítico", "Integrador", "Expressivo", "Pragmático", "Indefinido"];
const OUTCOME_OPTIONS = [
    { value: "", label: "Selecionar...", color: "" },
    { value: "GANHOU", label: "🏆 Ganhou", color: "text-emerald-400" },
    { value: "PERDEU", label: "❌ Perdeu", color: "text-red-400" },
    { value: "EM_ANDAMENTO", label: "⏳ Em Andamento", color: "text-amber-400" },
];

export default function FeedbackPanel({ meetingId, profiles, currentOutcome }: FeedbackPanelProps) {
    const [editingDisc, setEditingDisc] = useState<string | null>(null);
    const [selectedDisc, setSelectedDisc] = useState<string>("");
    const [notes, setNotes] = useState("");
    const [outcome, setOutcome] = useState(currentOutcome || "");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState<Record<string, boolean>>({});
    const [exporting, setExporting] = useState(false);

    async function saveFeedback(data: any) {
        setSaving(true);
        try {
            const r = await fetch(`/api/meetings/${meetingId}/feedback`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!r.ok) throw new Error("Erro ao salvar.");
            return true;
        } catch (e: any) {
            alert(e.message);
            return false;
        } finally {
            setSaving(false);
        }
    }

    async function handleConfirmDisc(participant: string, disc: string) {
        const ok = await saveFeedback({
            discCorrections: { participant, disc, confirmed: true },
        });
        if (ok) {
            setSaved(s => ({ ...s, [`disc-${participant}`]: true }));
            setEditingDisc(null);
        }
    }

    async function handleCorrectDisc(participant: string) {
        if (!selectedDisc) return;
        const ok = await saveFeedback({
            discCorrections: { participant, disc: selectedDisc, confirmed: true },
        });
        if (ok) {
            setSaved(s => ({ ...s, [`disc-${participant}`]: true }));
            setEditingDisc(null);
        }
    }

    async function handleSaveOutcome() {
        const ok = await saveFeedback({ dealOutcome: outcome || null });
        if (ok) setSaved(s => ({ ...s, outcome: true }));
    }

    async function handleSaveNotes() {
        if (!notes.trim()) return;
        const ok = await saveFeedback({ feedbackNotes: notes });
        if (ok) setSaved(s => ({ ...s, notes: true }));
    }

    async function handleExport() {
        setExporting(true);
        try {
            const r = await fetch(`/api/export/${meetingId}`);
            if (!r.ok) throw new Error("Erro ao exportar.");
            const blob = await r.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `analise_${meetingId.slice(0, 8)}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setExporting(false);
        }
    }

    return (
        <div className="space-y-4 mt-6">
            {/* Action Bar */}
            <div className="glass-card rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    Ações e Feedback
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Deal Outcome */}
                    <div className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                        <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
                            <Trophy className="w-3.5 h-3.5 inline mr-1" />
                            Resultado da Negociação
                        </label>
                        <div className="flex items-center gap-2">
                            <select
                                title="Resultado da negociação"
                                value={outcome}
                                onChange={e => { setOutcome(e.target.value); setSaved(s => ({ ...s, outcome: false })); }}
                                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-purple-500/50 outline-none transition-all"
                            >
                                {OUTCOME_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleSaveOutcome}
                                disabled={saving}
                                className="px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-medium hover:bg-purple-500/30 transition-all cursor-pointer disabled:opacity-40"
                            >
                                {saved.outcome ? <Check className="w-4 h-4 text-emerald-400" /> : "Salvar"}
                            </button>
                        </div>
                    </div>

                    {/* Export */}
                    <div className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                        <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
                            <Download className="w-3.5 h-3.5 inline mr-1" />
                            Exportar Relatório
                        </label>
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white text-sm font-medium hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            {exporting ? "Gerando..." : "Baixar Relatório (.txt)"}
                        </button>
                    </div>
                </div>
            </div>

            {/* DISC Feedback */}
            {profiles && profiles.length > 0 && (
                <div className="glass-card rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                        🧬 Feedback de Perfis DISC
                    </h3>
                    <p className="text-sm text-white/40 mb-4">
                        Confirme ou corrija o perfil detectado pela IA para melhorar análises futuras.
                    </p>

                    <div className="space-y-3">
                        {profiles.filter(p => p.participant !== "CONSULTOR").map((p, i) => (
                            <div key={i} className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-white/90">{p.participant}</span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold border bg-purple-500/20 text-purple-400 border-purple-500/30">
                                            {p.disc}
                                        </span>
                                        <span className="text-xs text-white/30">
                                            Confiança: {p.confidence}%
                                        </span>
                                    </div>

                                    {saved[`disc-${p.participant}`] ? (
                                        <span className="flex items-center gap-1 text-emerald-400 text-sm">
                                            <Check className="w-4 h-4" /> Perfil salvo
                                        </span>
                                    ) : editingDisc === p.participant ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                title="Corrigir perfil DISC"
                                                value={selectedDisc}
                                                onChange={e => setSelectedDisc(e.target.value)}
                                                className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none"
                                            >
                                                <option value="">Selecionar...</option>
                                                {DISC_OPTIONS.map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleCorrectDisc(p.participant)}
                                                disabled={!selectedDisc || saving}
                                                className="px-2 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-all cursor-pointer disabled:opacity-40"
                                            >
                                                Salvar
                                            </button>
                                            <button
                                                onClick={() => setEditingDisc(null)}
                                                className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 transition-all cursor-pointer"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleConfirmDisc(p.participant, p.disc)}
                                                disabled={saving}
                                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-all cursor-pointer disabled:opacity-40"
                                            >
                                                <Check className="w-3 h-3" /> Confirmar
                                            </button>
                                            <button
                                                onClick={() => { setEditingDisc(p.participant); setSelectedDisc(""); }}
                                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-all cursor-pointer"
                                            >
                                                <Edit3 className="w-3 h-3" /> Corrigir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes */}
            <div className="glass-card rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
                    📝 Notas Pessoais
                </h3>
                <textarea
                    value={notes}
                    onChange={e => { setNotes(e.target.value); setSaved(s => ({ ...s, notes: false })); }}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-purple-500/50 outline-none transition-all resize-y"
                    placeholder="Adicione observações, contexto ou lembretes sobre esta reunião..."
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleSaveNotes}
                        disabled={saving || !notes.trim()}
                        className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-medium hover:bg-purple-500/30 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2"
                    >
                        {saved.notes ? <><Check className="w-4 h-4 text-emerald-400" /> Salvo</> : "Salvar Notas"}
                    </button>
                </div>
            </div>
        </div>
    );
}
