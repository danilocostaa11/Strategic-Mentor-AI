import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildMarkdown,
  buildPlainText,
  isPharmaSegment,
  slugify,
} from "@/lib/vault-formatter";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const format = (searchParams.get("format") || "txt").toLowerCase();

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Reunião não encontrada." }, { status: 404 });
  }

  if (!meeting.analysisJson) {
    return NextResponse.json({ error: "Análise não disponível." }, { status: 400 });
  }

  // R-AZ2 — bloqueio de export markdown pra segmento Pharma
  if (format === "md") {
    const segment = meeting.segment || meeting.client?.segment;
    if (isPharmaSegment(segment)) {
      return NextResponse.json(
        {
          error: "Export Markdown bloqueado para segmento Pharma.",
          reason: "R-AZ2 do vault Segundo Cérebro — dados de visita médica não devem ser exportados pro vault YumIA/Yumida.",
          alternativa: "Use o processo de destilação manual descrito em 13-playbooks/destilacao-licoes-venda.md",
        },
        { status: 403 }
      );
    }
  }

  const analysis = JSON.parse(meeting.analysisJson);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mentor-ai-topaz.vercel.app";

  if (format === "md") {
    const markdown = buildMarkdown(meeting, analysis, baseUrl);
    const date = new Date(meeting.createdAt).toISOString().slice(0, 10);
    const titleSlug = slugify(meeting.title);
    const filename = `${date}-${titleSlug || id.slice(0, 8)}.md`;

    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // Default: TXT (comportamento original)
  const content = buildPlainText(meeting, analysis);
  const filename = `analise_${meeting.title.replace(/[^a-zA-Z0-9]/g, "_")}_${id.slice(0, 8)}.txt`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
