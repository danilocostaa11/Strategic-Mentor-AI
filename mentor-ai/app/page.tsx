import Link from "next/link";
import { Users, Video, Plus, ArrowRight, BrainCircuit, Target } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  let clientCount = 0;
  let meetingCount = 0;
  let recentMeetings: any[] = [];
  let avgStrat = "—";
  let avgClose = "—";

  try {
    const [clients, meetings, recent, avgStrategic, avgClosing] = await Promise.all([
      prisma.client.count(),
      prisma.meeting.count(),
      prisma.meeting.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { client: true },
      }),
      prisma.meeting.aggregate({ _avg: { strategicScore: true } }),
      prisma.meeting.aggregate({ _avg: { closingScore: true } }),
    ]);

    clientCount = clients;
    meetingCount = meetings;
    recentMeetings = recent;
    avgStrat = avgStrategic._avg.strategicScore?.toFixed(1) ?? "—";
    avgClose = avgClosing._avg.closingScore?.toFixed(1) ?? "—";
  } catch (e) {
    console.error("Dashboard: failed to load data", e);
  }

  const avgStratNum = parseFloat(avgStrat);
  const avgCloseNum = parseFloat(avgClose);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
          <p className="text-white/60">Resumo da sua operação de mentoria.</p>
        </div>
        <Link href="/meetings/new" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nova Análise</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{clientCount}</h3>
          <p className="text-sm text-white/50 font-medium">Clientes Cadastrados</p>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Video className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{meetingCount}</h3>
          <p className="text-sm text-white/50 font-medium">Reuniões Analisadas</p>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Target className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{avgStrat}</h3>
          <p className="text-sm text-white/50 font-medium">Score Estratégico Médio</p>
        </div>

        <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-purple-500/30 relative overflow-hidden flex flex-col justify-center items-center text-center">
          <h3 className="text-lg font-bold text-white mb-2">Descubra Padrões</h3>
          <p className="text-sm text-white/70 mb-4 px-2">Identifique tendências nas suas reuniões.</p>
          <Link href="/patterns" className="text-sm font-medium text-purple-300 hover:text-purple-200 flex items-center gap-2 group cursor-pointer transition-colors">
            Acessar <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Últimas Análises</h2>
            <Link href="/dashboard" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">Ver todas</Link>
          </div>

          {recentMeetings.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma análise ainda</h3>
              <p className="text-sm text-white/40 mb-4">Comece analisando sua primeira reunião!</p>
              <Link
                href="/meetings/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all"
              >
                <Plus className="w-4 h-4" /> Nova Análise
              </Link>
            </div>
          ) : (
            <div className="glass p-1 rounded-2xl flex flex-col gap-1">
              {recentMeetings.map((m) => {
                const scoreColor = (s: number | null) =>
                  s == null ? "text-white/20" : s >= 8 ? "text-emerald-400" : s >= 6 ? "text-blue-400" : s >= 4 ? "text-amber-400" : "text-red-400";
                return (
                  <Link
                    key={m.id}
                    href={`/meetings/${m.id}`}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium group-hover:text-purple-300 transition-colors">
                          {m.title}
                        </h4>
                        <p className="text-xs text-white/50">
                          {m.client?.name ? `${m.client.name} • ` : ""}{m.segment ?? ""} • {new Date(m.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`font-bold ${scoreColor(m.strategicScore)}`}>
                        {m.strategicScore ?? "—"}
                      </span>
                      <span className="text-white/10">/</span>
                      <span className={`font-bold ${scoreColor(m.closingScore)}`}>
                        {m.closingScore ?? "—"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Resumo</h2>
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Score Estratégico</span>
              <span className="text-lg font-bold text-purple-400">{avgStrat}/10</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${(isNaN(avgStratNum) ? 0 : avgStratNum) * 10}%` }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Score Fechamento</span>
              <span className="text-lg font-bold text-blue-400">{avgClose}/10</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${(isNaN(avgCloseNum) ? 0 : avgCloseNum) * 10}%` }} />
            </div>

            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Total Reuniões</span>
                <span className="text-lg font-bold text-white">{meetingCount}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Ação Rápida</h3>
            <Link
              href="/meetings/new"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20"
            >
              <Plus className="w-5 h-5" /> Nova Análise
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
