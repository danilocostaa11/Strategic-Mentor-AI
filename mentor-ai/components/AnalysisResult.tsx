"use client";

import { useState } from "react";
import FeedbackPanel from "@/components/FeedbackPanel";

// ─── Types ───────────────────────────────────────────────
interface Participant {
    label: string;
    role: string;
}

interface KeyQuote {
    speaker: string;
    quote: string;
}

interface ConversationBlock {
    block: string;
    highlights: string[];
    keyQuotes?: KeyQuote[];
}

interface Profile {
    participant: string;
    disc: string;
    confidence: number;
    evidence: string[];
}

interface Scores {
    strategic: number;
    closing: number;
    listening?: number;
}

interface NextMeetingPlan {
    goal: string;
    strategy: string[];
    questions: string[];
    closingStrategy: string[];
}

interface Analysis {
    participants?: Participant[];
    structuredConversation?: ConversationBlock[];
    profiles?: Profile[];
    scores?: Scores;
    strengths?: string[];
    improvements?: string[];
    missedOpportunities?: string[];
    nextMeetingPlan?: NextMeetingPlan;
    meta?: { segment?: string; promptVersion?: string; notes?: string };
}

// ─── Helper Components ───────────────────────────────────

function ScoreGauge({ label, value, icon }: { label: string; value: number; icon: string }) {
    const percentage = (value / 10) * 100;
    const getColor = (v: number) => {
        if (v >= 8) return { bar: "bg-emerald-500", glow: "shadow-emerald-500/30", text: "text-emerald-400" };
        if (v >= 6) return { bar: "bg-blue-500", glow: "shadow-blue-500/30", text: "text-blue-400" };
        if (v >= 4) return { bar: "bg-amber-500", glow: "shadow-amber-500/30", text: "text-amber-400" };
        return { bar: "bg-red-500", glow: "shadow-red-500/30", text: "text-red-400" };
    };
    const color = getColor(value);

    return (
        <div className="glass-card min-w-0 flex-1 rounded-xl p-5 sm:min-w-[160px]">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{icon}</span>
                <span className="text-sm text-white/60 font-medium">{label}</span>
            </div>
            <div className={`text-3xl font-bold ${color.text} mb-3`}>
                {value}<span className="text-lg text-white/30">/10</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${color.bar} ${color.glow} shadow-lg transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function DISCBadge({ disc }: { disc: string }) {
    const colors: Record<string, string> = {
        "Analítico": "bg-blue-500/20 text-blue-400 border-blue-500/30",
        "Integrador": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        "Expressivo": "bg-amber-500/20 text-amber-400 border-amber-500/30",
        "Pragmático": "bg-red-500/20 text-red-400 border-red-500/30",
    };
    const style = colors[disc] || "bg-purple-500/20 text-purple-400 border-purple-500/30";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
            {disc}
        </span>
    );
}

function RoleBadge({ role }: { role: string }) {
    const labels: Record<string, string> = {
        decisor: "🎯 Decisor",
        influenciador: "💡 Influenciador",
        tecnico: "🔧 Técnico",
        observador: "👁️ Observador",
        consultor: "🧠 Consultor",
        indefinido: "❓ Indefinido",
    };
    return (
        <span className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-white/50">
            {labels[role] || role}
        </span>
    );
}

function BlockIcon({ block }: { block: string }) {
    const icons: Record<string, string> = {
        RAPPORT: "🤝",
        "TRANSIÇÃO": "🔄",
        "DIAGNÓSTICO": "🔍",
        DORES: "💢",
        "ARGUMENTAÇÃO": "💬",
        "OBJEÇÕES": "🛡️",
        "AVANÇO/FECHAMENTO": "🎯",
        ENCERRAMENTO: "👋",
    };
    return <span>{icons[block] || "📌"}</span>;
}

function Section({ title, icon, children, defaultOpen = true }: {
    title: string;
    icon: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="glass-card rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-3 p-4 transition-colors cursor-pointer hover:bg-white/[0.02] sm:p-5"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <h3 className="text-left text-base font-semibold text-white sm:text-lg">{title}</h3>
                </div>
                <span className={`text-white/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
                    ▼
                </span>
            </button>
            <div
                className={`grid transition-all duration-300 ease-in-out ${
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
            >
                <div className="min-h-0 overflow-hidden">
                    <div className="border-t border-white/5 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────

export default function AnalysisResult({ analysis, meetingId, clientName }: { analysis: Analysis; meetingId?: string; clientName?: string | null }) {
    if (!analysis) return null;

    const { participants, structuredConversation, profiles, scores, strengths, improvements, missedOpportunities, nextMeetingPlan, meta } = analysis;

    return (
        <div className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold gradient-text">Resultado da Análise</h2>
                    <p className="text-sm text-white/40 mt-1">
                        {clientName && <span className="text-purple-400 font-medium">Cliente: {clientName} • </span>}
                        {meta?.promptVersion && <>Versão: {meta.promptVersion} • </>}
                        {meta?.segment || "N/A"}
                    </p>
                </div>
                {meetingId && (
                    <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/40 border border-white/10">
                        ID: {meetingId}
                    </span>
                )}
            </div>

            {/* Scores */}
            {scores && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <ScoreGauge label="Estratégia" value={scores.strategic} icon="🧠" />
                    <ScoreGauge label="Fechamento" value={scores.closing} icon="🎯" />
                    {scores.listening !== undefined && (
                        <ScoreGauge label="Escuta Ativa" value={scores.listening} icon="👂" />
                    )}
                </div>
            )}

            {/* Participants */}
            {participants && participants.length > 0 && (
                <Section title="Participantes" icon="👥">
                    <div className="flex flex-wrap gap-3">
                        {participants.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2">
                                <span className="font-medium text-white/90">{p.label}</span>
                                <RoleBadge role={p.role} />
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* DISC Profiles */}
            {profiles && profiles.length > 0 && (
                <Section title="Perfis DISC" icon="🧬">
                    <div className="space-y-4">
                        {profiles.map((p, i) => (
                            <div key={i} className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                    <span className="font-semibold text-white/90">{p.participant}</span>
                                    <DISCBadge disc={p.disc} />
                                    <span className="text-sm text-white/40">
                                        Confiança: <span className={`font-semibold ${p.confidence >= 70 ? "text-emerald-400" : p.confidence >= 40 ? "text-amber-400" : "text-red-400"}`}>
                                            {p.confidence}%
                                        </span>
                                    </span>
                                </div>
                                {p.evidence && p.evidence.length > 0 && (
                                    <div className="space-y-1.5 mt-2">
                                        <span className="text-xs text-white/30 uppercase tracking-wider">Evidências</span>
                                        {p.evidence.map((e, j) => (
                                            <p key={j} className="text-sm text-white/60 pl-3 border-l-2 border-purple-500/30 italic">
                                                &ldquo;{e}&rdquo;
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Structured Conversation */}
            {structuredConversation && structuredConversation.length > 0 && (
                <Section title="Conversa Estruturada" icon="💬" defaultOpen={false}>
                    <div className="space-y-4">
                        {structuredConversation.map((block, i) => (
                            <div key={i} className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <BlockIcon block={block.block} />
                                    <span className="font-semibold text-white/90 text-sm uppercase tracking-wider">
                                        {block.block}
                                    </span>
                                </div>
                                <ul className="space-y-1.5 mb-3">
                                    {block.highlights.map((h, j) => (
                                        <li key={j} className="text-sm text-white/60 flex items-start gap-2">
                                            <span className="text-purple-400 mt-0.5">•</span> {h}
                                        </li>
                                    ))}
                                </ul>
                                {block.keyQuotes && block.keyQuotes.length > 0 && (
                                    <div className="space-y-2 mt-3 pt-3 border-t border-white/5">
                                        {block.keyQuotes.map((q, j) => (
                                            <div key={j} className="text-sm pl-3 border-l-2 border-purple-500/20">
                                                <span className="text-purple-400 font-medium">{q.speaker}:</span>{" "}
                                                <span className="text-white/50 italic">&ldquo;{q.quote}&rdquo;</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strengths && strengths.length > 0 && (
                    <Section title="Pontos Fortes" icon="✅">
                        <ul className="space-y-2">
                            {strengths.map((s, i) => (
                                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span> {s}
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}

                {improvements && improvements.length > 0 && (
                    <Section title="Pontos de Melhoria" icon="⚡">
                        <ul className="space-y-2">
                            {improvements.map((s, i) => (
                                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                    <span className="text-amber-400 mt-0.5 shrink-0">→</span> {s}
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}
            </div>

            {/* Missed Opportunities */}
            {missedOpportunities && missedOpportunities.length > 0 && (
                <Section title="Oportunidades Perdidas" icon="🔓" defaultOpen={false}>
                    <ul className="space-y-2">
                        {missedOpportunities.map((s, i) => (
                            <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                <span className="text-red-400 mt-0.5 shrink-0">✗</span> {s}
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* Next Meeting Plan */}
            {nextMeetingPlan && (
                <Section title="Plano da Próxima Reunião" icon="📋">
                    <div className="space-y-5">
                        {/* Goal */}
                        <div className="bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg p-4 border border-purple-500/20">
                            <span className="text-xs text-white/30 uppercase tracking-wider">Objetivo</span>
                            <p className="text-white/90 font-medium mt-1">{nextMeetingPlan.goal}</p>
                        </div>

                        {/* Strategy */}
                        {nextMeetingPlan.strategy && (
                            <div>
                                <h4 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Estratégia</h4>
                                <ul className="space-y-1.5">
                                    {nextMeetingPlan.strategy.map((s, i) => (
                                        <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                            <span className="text-purple-400 mt-0.5">▸</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Questions */}
                        {nextMeetingPlan.questions && (
                            <div>
                                <h4 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Perguntas Estratégicas</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {nextMeetingPlan.questions.map((q, i) => (
                                        <div key={i} className="text-sm text-white/70 bg-white/[0.03] rounded-lg px-4 py-2.5 border border-white/5">
                                            <span className="text-purple-400 font-mono mr-2">{String(i + 1).padStart(2, "0")}.</span> {q}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Closing Strategy */}
                        {nextMeetingPlan.closingStrategy && (
                            <div>
                                <h4 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Estratégia de Fechamento</h4>
                                <ul className="space-y-1.5">
                                    {nextMeetingPlan.closingStrategy.map((s, i) => (
                                        <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                            <span className="text-emerald-400 mt-0.5">🎯</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </Section>
            )}

            {/* Meta Notes */}
            {meta?.notes && (
                <div className="text-sm text-white/30 italic bg-white/[0.02] rounded-lg p-4 border border-white/5">
                    <span className="text-white/50 not-italic font-medium">Nota:</span> {meta.notes}
                </div>
            )}

            {/* Feedback Panel */}
            {meetingId && (
                <FeedbackPanel
                    meetingId={meetingId}
                    profiles={profiles}
                />
            )}
        </div>
    );
}
