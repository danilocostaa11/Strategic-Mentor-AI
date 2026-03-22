"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AnalysisResult from "@/components/AnalysisResult";
import { showToast } from "@/components/Toast";
import { FileText, AlertTriangle } from "lucide-react";

type Client = { id: string; name: string };

const ANALYSIS_STEPS = [
  { label: "Lendo transcrição...", icon: "📄", duration: 2000 },
  { label: "Separando falas dos participantes...", icon: "🗣️", duration: 3000 },
  { label: "Classificando perfis DISC...", icon: "🧬", duration: 4000 },
  { label: "Analisando estratégia e escuta...", icon: "📊", duration: 5000 },
  { label: "Gerando plano de ação...", icon: "🎯", duration: 8000 },
  { label: "Finalizando relatório...", icon: "✅", duration: 15000 },
];

function WordCount({ text }: { text: string }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedMinutes = Math.max(1, Math.ceil(words / 150));
  const tooShort = words > 0 && words < 50;

  return (
    <div className="mt-2 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <span className="text-xs text-white/30 flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {words} palavras
        </span>
        {words > 0 && (
          <span className="text-xs text-white/30">
            ~{estimatedMinutes} min de análise
          </span>
        )}
      </div>
      {tooShort && (
        <span className="flex items-center gap-1 text-xs text-amber-400">
          <AlertTriangle className="w-3 h-3" />
          Recomendado: mínimo 200 palavras
        </span>
      )}
    </div>
  );
}

function AnalysisProgress({ startTime }: { startTime: number }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers = ANALYSIS_STEPS.map((step, i) =>
      setTimeout(() => setCurrentStep(i), step.duration)
    );
    return () => timers.forEach(clearTimeout);
  }, [startTime]);

  return (
    <div className="glass-card rounded-xl p-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-semibold text-white mb-4">Analisando sua reunião...</h3>
      <div className="space-y-2">
        {ANALYSIS_STEPS.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-500 ${i < currentStep
                ? "text-white/40"
                : i === currentStep
                  ? "bg-purple-500/10 text-white"
                  : "text-white/15"
              }`}
          >
            <span className={`text-lg transition-all ${i <= currentStep ? "opacity-100" : "opacity-30"}`}>
              {i < currentStep ? "✓" : step.icon}
            </span>
            <span className={`text-sm font-medium ${i < currentStep ? "line-through" : ""}`}>
              {step.label}
            </span>
            {i === currentStep && (
              <div className="ml-auto flex gap-1">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${((currentStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function NewMeetingContent() {
  const searchParams = useSearchParams();
  const resultRef = useRef<HTMLDivElement>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [title, setTitle] = useState("Reunião");
  const [segment, setSegment] = useState("Pharma");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [analysisStart, setAnalysisStart] = useState(0);

  const selectedClientName = clients.find(c => c.id === clientId)?.name ?? null;

  useEffect(() => {
    fetch("/api/clients")
      .then(r => r.json())
      .then(setClients)
      .catch(() => setClients([]));

    // Load example transcript from onboarding
    if (searchParams.get("example") === "1") {
      const example = localStorage.getItem("example-transcript");
      if (example) {
        setTranscript(example);
        localStorage.removeItem("example-transcript");
      }
    }

    // Load user preferences
    const savedSegment = localStorage.getItem("user-segment");
    if (savedSegment) setSegment(savedSegment);
  }, [searchParams]);

  const run = useCallback(async () => {
    setLoading(true);
    setResult(null);
    setAnalysisStart(Date.now());
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: clientId || null, title, segment, transcript }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Erro ao analisar.");
      setResult(data);
      showToast("Análise concluída com sucesso! 🎉", "success");

      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch (e: any) {
      showToast(e.message ?? "Erro ao analisar.", "error");
    } finally {
      setLoading(false);
    }
  }, [clientId, title, segment, transcript]);

  return (
    <main className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold gradient-text mb-6">Nova Análise</h2>

      <div className="glass-card rounded-xl p-4 space-y-5 sm:p-6">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Reunião de Negociação"
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Segmento</label>
            <select
              title="Segmento da reunião"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
            >
              <option value="Pharma">🧪 Pharma</option>
              <option value="Imob">🏠 Imob</option>
              <option value="IA">🤖 IA / B2B</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1.5">Cliente (opcional)</label>
            <select
              title="Cliente da reunião"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all"
            >
              <option value="">— sem cliente —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">Transcrição</label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 outline-none transition-all resize-y"
            placeholder="Cole aqui a transcrição bruta..."
          />
          <WordCount text={transcript} />
        </div>

        <button
          onClick={run}
          disabled={loading || transcript.trim().length < 20}
          className="w-full py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/20"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Analisando...
            </span>
          ) : (
            "Analisar"
          )}
        </button>
      </div>

      {/* Loading Progress */}
      {loading && <AnalysisProgress startTime={analysisStart} />}

      {/* Result */}
      <div ref={resultRef}>
        {result?.analysis && (
          <AnalysisResult
            analysis={result.analysis}
            meetingId={result.meetingId}
            clientName={result.clientName || selectedClientName}
          />
        )}
      </div>
    </main>
  );
}

export default function NewMeetingPage() {
  return (
    <Suspense>
      <NewMeetingContent />
    </Suspense>
  );
}
