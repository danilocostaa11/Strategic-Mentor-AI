import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzePatterns } from "@/lib/analyzer";

export async function POST(req: Request) {
  const body = await req.json();
  const meetingIds: string[] = body.meetingIds ?? [];
  const segment: string | null = body.segment ?? null;

  if (!Array.isArray(meetingIds) || meetingIds.length < 3) {
    return NextResponse.json({ error: "Selecione pelo menos 3 reuniões." }, { status: 400 });
  }

  const meetings = await prisma.meeting.findMany({
    where: { id: { in: meetingIds } },
    select: { id: true, analysisJson: true },
  });

  const analyses = meetings
    .map(m => (m.analysisJson ? JSON.parse(m.analysisJson) : null))
    .filter(Boolean);

  try {
    const report = await analyzePatterns({ analyses, segment });

    await prisma.patternReport.create({
      data: {
        meetingIds: JSON.stringify(meetingIds),
        reportJson: JSON.stringify(report),
      },
    });

    await prisma.meeting.updateMany({
      where: { id: { in: meetingIds } },
      data: { includedInPattern: true },
    });

    return NextResponse.json(report);
  } catch (error: any) {
    const message =
      error?.status === 429
        ? "Análise temporariamente indisponível. Tente novamente em alguns segundos."
        : "Falha ao processar análise de padrões.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
