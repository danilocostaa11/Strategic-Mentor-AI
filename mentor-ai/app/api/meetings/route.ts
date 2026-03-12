import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const meetings = await prisma.meeting.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true },
  });
  return NextResponse.json(meetings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const meeting = await prisma.meeting.create({
    data: {
      clientId: body.clientId ?? null,
      title: body.title,
      segment: body.segment ?? null,
      rawTranscript: body.rawTranscript,
      analysisJson: body.analysisJson ?? null,
      strategicScore: body.strategicScore ?? null,
      closingScore: body.closingScore ?? null,
    },
  });
  return NextResponse.json(meeting);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
  }

  try {
    await prisma.meeting.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Reunião não encontrada." }, { status: 404 });
  }
}

