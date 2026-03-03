import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const body = await req.json();
  const client = await prisma.client.create({
    data: {
      name: body.name,
      company: body.company ?? null,
      segment: body.segment ?? null,
      profileManual: body.profileManual ?? null,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(client);
}
