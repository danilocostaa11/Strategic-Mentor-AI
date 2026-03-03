import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeMeeting } from "@/lib/analyzer";

export async function POST(req: Request) {
  const body = await req.json();

  const transcript: string = body.transcript ?? "";
  const clientId: string | null = body.clientId ?? null;
  const title: string = body.title ?? "Reunião";
  const segment: string | null = body.segment ?? null;

  if (!transcript || transcript.trim().length < 20) {
    return NextResponse.json({ error: "Transcrição muito curta." }, { status: 400 });
  }

  let clientContext: string | null = null;

  if (clientId) {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (client) {
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

  const analysis = await analyzeMeeting({ transcript, segment, clientContext });

  const strategicScore = Number(analysis?.scores?.strategic ?? null);
  const closingScore = Number(analysis?.scores?.closing ?? null);

  const meeting = await prisma.meeting.create({
    data: {
      clientId,
      title,
      segment,
      rawTranscript: transcript,
      analysisJson: JSON.stringify(analysis),
      strategicScore: Number.isFinite(strategicScore) ? strategicScore : null,
      closingScore: Number.isFinite(closingScore) ? closingScore : null,
    },
  });

  return NextResponse.json({ meetingId: meeting.id, analysis });
}
