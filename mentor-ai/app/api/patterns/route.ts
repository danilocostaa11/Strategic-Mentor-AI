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
    select: { analysisJson: true },
  });

  const analyses = meetings
    .map(m => (m.analysisJson ? JSON.parse(m.analysisJson) : null))
    .filter(Boolean);

  const report = await analyzePatterns({ analyses, segment });
  return NextResponse.json(report);
}
