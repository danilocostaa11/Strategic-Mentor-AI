import { prisma } from "@/lib/prisma";
import AnalysisResultClient from "./AnalysisResultClient";

export const dynamic = "force-dynamic";

export default async function MeetingPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!meeting) return <main className="p-6">Não encontrado.</main>;

  const analysis = meeting.analysisJson ? JSON.parse(meeting.analysisJson) : null;

  return (
    <main className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold gradient-text">{meeting.title}</h2>
        <p className="text-white/50 mt-1">
          {meeting.client?.name ? `Cliente: ${meeting.client.name} • ` : ""}
          Segmento: {meeting.segment ?? "N/A"} •{" "}
          {new Date(meeting.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </p>
      </div>

      {analysis ? (
        <AnalysisResultClient analysis={analysis} meetingId={meeting.id} clientName={meeting.client?.name} />
      ) : (
        <div className="glass-card rounded-xl p-8 text-center text-white/40">
          Sem análise salva para esta reunião.
        </div>
      )}
    </main>
  );
}
