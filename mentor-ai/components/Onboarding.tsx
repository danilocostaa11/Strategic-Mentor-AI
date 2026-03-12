"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, User, Rocket, ArrowRight, ChevronRight } from "lucide-react";

const SEGMENTS = ["Pharma", "Imob", "IA"];

const EXAMPLE_TRANSCRIPT = `CONSULTOR: Bom dia, Dr. Eduardo! Tudo bem?

CLIENTE: Bom dia! Tudo ótimo, obrigado.

CONSULTOR: Que bom! Então, Dr. Eduardo, como mencionei por e-mail, gostaria de apresentar uma solução que tem ajudado bastante outros profissionais da sua área. Posso explicar como funciona?

CLIENTE: Claro, pode sim. Estou curioso.

CONSULTOR: Excelente! Antes de entrar nos detalhes, me conta um pouco: quais são os maiores desafios que o senhor enfrenta hoje na gestão dos atendimentos?

CLIENTE: Olha, o principal é a organização. Tenho muitos pacientes e às vezes perco o controle do acompanhamento.

CONSULTOR: Entendo perfeitamente. E isso impacta na satisfação dos pacientes?

CLIENTE: Com certeza. Alguns reclamam que demoro para retornar.

CONSULTOR: Faz sentido. A nossa plataforma resolve exatamente isso, com um sistema de acompanhamento automatizado. Posso te mostrar como funciona na prática?

CLIENTE: Sim, me mostra.`;

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [mainSegment, setMainSegment] = useState("Pharma");
    const [goal, setGoal] = useState("");

    function finish() {
        localStorage.setItem("onboarding-done", "1");
        if (name) localStorage.setItem("user-name", name);
        if (mainSegment) localStorage.setItem("user-segment", mainSegment);
        router.push("/");
    }

    function goAnalyze() {
        localStorage.setItem("onboarding-done", "1");
        if (name) localStorage.setItem("user-name", name);
        if (mainSegment) localStorage.setItem("user-segment", mainSegment);
        localStorage.setItem("example-transcript", EXAMPLE_TRANSCRIPT);
        router.push("/meetings/new?example=1");
    }

    return (
        <div className="fixed inset-0 z-[200] bg-[#09090b] flex items-center justify-center p-4">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-lg">
                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-purple-500" : i < step ? "w-2 bg-purple-500/50" : "w-2 bg-white/10"
                                }`}
                        />
                    ))}
                </div>

                {/* Step 0: Welcome */}
                {step === 0 && (
                    <div className="glass-card rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                                <BrainCircuit className="w-9 h-9 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-center gradient-text mb-3">
                            Bem-vindo ao Mentor AI
                        </h1>
                        <p className="text-center text-white/50 mb-8 leading-relaxed">
                            Transforme transcrições de reuniões em <strong className="text-white/80">diagnósticos estratégicos</strong> com inteligência artificial.
                            Descubra perfis DISC, identifique padrões e receba planos de ação personalizados.
                        </p>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                                <div className="text-2xl mb-1">🧬</div>
                                <div className="text-[10px] text-white/40 font-medium">Perfil DISC</div>
                            </div>
                            <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                                <div className="text-2xl mb-1">📊</div>
                                <div className="text-[10px] text-white/40 font-medium">Análise Estratégica</div>
                            </div>
                            <div className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/5">
                                <div className="text-2xl mb-1">🎯</div>
                                <div className="text-[10px] text-white/40 font-medium">Plano de Ação</div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(1)}
                            className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                        >
                            Começar <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Step 1: Profile */}
                {step === 1 && (
                    <div className="glass-card rounded-2xl p-8 animate-in fade-in slide-in-from-right duration-500">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                                <User className="w-7 h-7 text-blue-400" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-center text-white mb-2">
                            Sobre você
                        </h2>
                        <p className="text-center text-white/40 mb-6 text-sm">
                            Personalize sua experiência de mentoria.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-white/60 block mb-1.5">Seu nome</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ex: Danilo Costa"
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-white/60 block mb-1.5">Segmento principal</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {SEGMENTS.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setMainSegment(s)}
                                            className={`py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer border ${mainSegment === s
                                                    ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                                                    : "bg-white/[0.03] border-white/10 text-white/50 hover:bg-white/[0.06]"
                                                }`}
                                        >
                                            {s === "Pharma" ? "🧪 Pharma" : s === "Imob" ? "🏠 Imob" : "🤖 IA / B2B"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-white/60 block mb-1.5">Meta de melhoria (opcional)</label>
                                <input
                                    type="text"
                                    value={goal}
                                    onChange={e => setGoal(e.target.value)}
                                    placeholder="Ex: Melhorar taxa de fechamento"
                                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setStep(0)}
                                className="px-5 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                            >
                                Próximo <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: First Analysis */}
                {step === 2 && (
                    <div className="glass-card rounded-2xl p-8 animate-in fade-in slide-in-from-right duration-500">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                                <Rocket className="w-7 h-7 text-emerald-400" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-center text-white mb-2">
                            Tudo pronto! 🎉
                        </h2>
                        <p className="text-center text-white/40 mb-6 text-sm">
                            Experimente agora com uma transcrição de exemplo ou vá direto para o dashboard.
                        </p>

                        <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 mb-6">
                            <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Preview da transcrição</div>
                            <div className="text-xs text-white/50 font-mono leading-relaxed max-h-32 overflow-y-auto">
                                {EXAMPLE_TRANSCRIPT.slice(0, 300)}...
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={goAnalyze}
                                className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                                <Rocket className="w-5 h-5" /> Analisar agora
                            </button>
                            <button
                                onClick={finish}
                                className="w-full py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer border border-white/5"
                            >
                                Ir para o Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
