import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeMeeting } from "@/lib/analyzer";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const transcript: string = body.transcript ?? "";
  const clientId: string | null = body.clientId ?? null;
  const title: string = body.title ?? "Reunião";
  const segment: string | null = body.segment ?? null;

  if (!transcript || transcript.trim().length < 20) {
    return NextResponse.json({ error: "Transcrição muito curta." }, { status: 400 });
  }

  let clientContext: string | null = null;
  let clientName: string | null = null;

  if (clientId) {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (client) {
      clientName = client.name;
      clientContext = [
        `Nome: ${client.name}`,
        client.company ? `Empresa: ${client.company}` : "",
        client.segment ? `Segmento: ${client.segment}` : "",
        client.profileManual ? `Perfil manual: ${client.profileManual}` : "",
        client.profileAI ? `Perfil IA: ${client.profileAI}` : "",
        client.notes ? `Notas: ${client.notes}` : "",
      ].filter(Boolean).join("\n");
    }
  }

  const meeting = await prisma.meeting.create({
    data: {
      clientId,
      title,
      segment,
      rawTranscript: transcript,
      status: "ANALYZING",
    },
  });

  try {
    const result = await analyzeMeeting({ transcript, segment, clientContext });

    const rawStrategic = result.analysis?.scores?.strategic;
    const rawClosing = result.analysis?.scores?.closing;
    const rawListening = result.analysis?.scores?.listening;
    const strategicScore = rawStrategic != null ? Number(rawStrategic) : NaN;
    const closingScore = rawClosing != null ? Number(rawClosing) : NaN;
    const listeningScore = rawListening != null ? Number(rawListening) : NaN;

    const updated = await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        analysisJson: JSON.stringify(result.analysis),
        analysisVersion: result.promptVersion,
        promptVersion: result.promptVersion,
        promptHash: result.promptHash,
        strategicScore: Number.isFinite(strategicScore) ? strategicScore : null,
        closingScore: Number.isFinite(closingScore) ? closingScore : null,
        listeningScore: Number.isFinite(listeningScore) ? listeningScore : null,
        status: "DONE",
      },
    });

    return NextResponse.json({
      meetingId: updated.id,
      clientName,
      analysis: result.analysis,
      promptVersion: result.promptVersion,
      fromCache: result.fromCache,
    });
  } catch (error: any) {
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { status: "ERROR" },
    });

    const message =
      error?.status === 429
        ? "Análise temporariamente indisponível. Sua transcrição foi salva."
        : "Falha ao processar análise. Sua transcrição foi salva.";

    return NextResponse.json(
      { error: message, meetingId: meeting.id },
      { status: 500 }
    );
  }
}
