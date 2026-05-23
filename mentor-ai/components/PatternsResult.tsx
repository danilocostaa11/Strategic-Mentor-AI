"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────
interface ProfilePerformance {
    disc: string;
    trend: string;
    notes: string;
}

interface Evolution {
    trend: string;
    evidence: string[];
}

interface Plan30Days {
    focus: string[];
    microHabits: string[];
    weeklyDrills: string[];
    checklistBeforeMeeting: string[];
    checklistAfterMeeting: string[];
}

interface PatternsReport {
    summary: string;
    recurringStrengths: string[];
    recurringWeaknesses: string[];
    closingPatterns: string[];
    listeningPatterns: string[];
    profilePerformance: ProfilePerformance[];
    evolution: Evolution;
    plan30Days: Plan30Days;
    alertTriggered: boolean;
    alertMessage: string;
}

// ─── Helpers ─────────────────────────────────────────────

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

function TrendBadge({ trend }: { trend: string }) {
    const config: Record<string, { color: string; icon: string }> = {
        melhorando: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: "📈" },
        estável: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: "➡️" },
        piorando: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: "📉" },
        indefinido: { color: "bg-white/10 text-white/50 border-white/20", icon: "❓" },
        melhor: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: "✅" },
        pior: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: "⚠️" },
        misto: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: "🔀" },
    };
    const c = config[trend] || config.indefinido;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${c.color}`}>
            {c.icon} {trend}
        </span>
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

// ─── Main Component ──────────────────────────────────────

export default function PatternsResult({ report }: { report: PatternsReport }) {
    if (!report) return null;

    return (
        <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <h2 className="text-2xl font-bold gradient-text">Análise de Padrões</h2>

            {/* Alert */}
            {report.alertTriggered && report.alertMessage && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-xl">🚨</span>
                    <p className="text-red-400 font-medium">{report.alertMessage}</p>
                </div>
            )}

            {/* Summary */}
            <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">📊</span>
                    <h3 className="text-lg font-semibold text-white">Resumo Geral</h3>
                </div>
                <p className="text-white/70 leading-relaxed">{report.summary}</p>
            </div>

            {/* Evolution */}
            {report.evolution && (
                <div className="glass-card rounded-xl p-5 sm:p-6">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">📈</span>
                            <h3 className="text-lg font-semibold text-white">Evolução</h3>
                        </div>
                        <TrendBadge trend={report.evolution.trend} />
                    </div>
                    {report.evolution.evidence && report.evolution.evidence.length > 0 && (
                        <ul className="space-y-2">
                            {report.evolution.evidence.map((e, i) => (
                                <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                                    <span className="text-purple-400 mt-0.5">•</span> {e}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.recurringStrengths && report.recurringStrengths.length > 0 && (
                    <Section title="Forças Recorrentes" icon="✅">
                        <ul className="space-y-2">
                            {report.recurringStrengths.map((s, i) => (
                                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span> {s}
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}

                {report.recurringWeaknesses && report.recurringWeaknesses.length > 0 && (
                    <Section title="Fraquezas Recorrentes" icon="⚠️">
                        <ul className="space-y-2">
                            {report.recurringWeaknesses.map((s, i) => (
                                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                    <span className="text-amber-400 mt-0.5 shrink-0">→</span> {s}
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}
            </div>

            {/* Closing & Listening Patterns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.closingPatterns && report.closingPatterns.length > 0 && (
                    <Section title="Padrões de Fechamento" icon="🎯">
                        <ul className="space-y-2">
                            {report.closingPatterns.map((s, i) => (
                                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                    <span className="text-purple-400 mt-0.5 shrink-0">▸</span> {s}
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}

                {report.listeningPatterns && report.listeningPatterns.length > 0 && (
                    <Section title="Padrões de Escuta" icon="👂">
                        <ul className="space-y-2">
                            {report.listeningPatterns.map((s, i) => (
                                <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                    <span className="text-blue-400 mt-0.5 shrink-0">▸</span> {s}
                                </li>
                            ))}
                        </ul>
                    </Section>
                )}
            </div>

            {/* Profile Performance */}
            {report.profilePerformance && report.profilePerformance.length > 0 && (
                <Section title="Performance por Perfil DISC" icon="🧬">
                    <div className="space-y-3">
                        {report.profilePerformance.map((p, i) => (
                            <div key={i} className="flex flex-col gap-2 rounded-lg border border-white/5 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:gap-3">
                                <DISCBadge disc={p.disc} />
                                <TrendBadge trend={p.trend} />
                                <span className="text-sm text-white/60">{p.notes}</span>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* 30 Day Plan */}
            {report.plan30Days && (
                <Section title="Plano de 30 Dias" icon="🗓️">
                    <div className="space-y-5">
                        {/* Focus */}
                        {report.plan30Days.focus && report.plan30Days.focus.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Focos Principais</h4>
                                <div className="flex flex-wrap gap-2">
                                    {report.plan30Days.focus.map((f, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-300">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Micro Habits */}
                        {report.plan30Days.microHabits && report.plan30Days.microHabits.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Micro-Hábitos</h4>
                                <ul className="space-y-1.5">
                                    {report.plan30Days.microHabits.map((h, i) => (
                                        <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                            <span className="text-emerald-400 mt-0.5">💡</span> {h}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Weekly Drills */}
                        {report.plan30Days.weeklyDrills && report.plan30Days.weeklyDrills.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-white/50 mb-2 uppercase tracking-wider">Exercícios Semanais</h4>
                                <ul className="space-y-1.5">
                                    {report.plan30Days.weeklyDrills.map((d, i) => (
                                        <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                                            <span className="text-blue-400 mt-0.5">🏋️</span> {d}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Checklists */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {report.plan30Days.checklistBeforeMeeting && report.plan30Days.checklistBeforeMeeting.length > 0 && (
                                <div className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                                    <h4 className="text-sm font-semibold text-white/50 mb-2">✅ Antes da Reunião</h4>
                                    <ul className="space-y-1.5">
                                        {report.plan30Days.checklistBeforeMeeting.map((c, i) => (
                                            <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                                                <span className="text-white/30">☐</span> {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {report.plan30Days.checklistAfterMeeting && report.plan30Days.checklistAfterMeeting.length > 0 && (
                                <div className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                                    <h4 className="text-sm font-semibold text-white/50 mb-2">📝 Após a Reunião</h4>
                                    <ul className="space-y-1.5">
                                        {report.plan30Days.checklistAfterMeeting.map((c, i) => (
                                            <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                                                <span className="text-white/30">☐</span> {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </Section>
            )}
        </div>
    );
}
