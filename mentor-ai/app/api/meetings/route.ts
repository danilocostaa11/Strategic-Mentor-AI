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
