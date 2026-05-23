import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        meetings: {
          select: {
            id: true,
            title: true,
            strategicScore: true,
            closingScore: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar clientes." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }
    const client = await prisma.client.create({
      data: {
        name: body.name,
        company: body.company ?? null,
        segment: body.segment ?? null,
        profileManual: body.profileManual ?? null,
        notes: body.notes ?? null,
      },
      include: {
        meetings: true,
      },
    });
    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar cliente." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.company !== undefined) updateData.company = body.company ?? null;
    if (body.segment !== undefined) updateData.segment = body.segment ?? null;
    if (body.profileManual !== undefined) updateData.profileManual = body.profileManual ?? null;
    if (body.profileAI !== undefined) updateData.profileAI = body.profileAI ?? null;
    if (body.profileConfirmed !== undefined) updateData.profileConfirmed = body.profileConfirmed;
    if (body.notes !== undefined) updateData.notes = body.notes ?? null;
    if (body.profileConfirmed !== undefined) {
      updateData.profileConfidence = body.profileConfirmed ? 1.0 : null;
    }

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        meetings: {
          select: {
            id: true,
            title: true,
            strategicScore: true,
            closingScore: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar cliente." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir cliente. Verifique se ele possui reuniões vinculadas." }, { status: 500 });
  }
}
