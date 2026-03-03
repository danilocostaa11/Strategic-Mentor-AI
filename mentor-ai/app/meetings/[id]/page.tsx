import { prisma } from "@/lib/prisma";

export default async function MeetingPage({ params }: { params: { id: string } }) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: params.id },
    include: { client: true },
  });

  if (!meeting) return <main style={{ padding: 24 }}>Não encontrado.</main>;

  const analysis = meeting.analysisJson ? JSON.parse(meeting.analysisJson) : null;

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>{meeting.title}</h2>
      <p style={{ opacity: 0.75 }}>
        {meeting.client?.name ? `Cliente: ${meeting.client.name} • ` : ""}
        Segmento: {meeting.segment ?? "N/A"}
      </p>

      <h3 style={{ marginTop: 14, fontWeight: 700 }}>Análise</h3>
      <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#fff", padding: 12, borderRadius: 8 }}>
        {analysis ? JSON.stringify(analysis, null, 2) : "Sem análise salva."}
      </pre>
    </main>
  );
}
