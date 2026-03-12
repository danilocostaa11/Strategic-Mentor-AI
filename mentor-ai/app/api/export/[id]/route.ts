import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

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

    const analysis = JSON.parse(meeting.analysisJson);
    const clientName = meeting.client?.name || "Sem cliente";
    const date = new Date(meeting.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "long", year: "numeric"
    });

    // Build plain-text sections for PDF
    const sections: string[] = [];

    sections.push("═".repeat(60));
    sections.push("STRATEGIC MENTOR AI — RELATÓRIO DE ANÁLISE");
    sections.push("═".repeat(60));
    sections.push("");
    sections.push(`Reunião: ${meeting.title}`);
    sections.push(`Cliente: ${clientName}`);
    sections.push(`Segmento: ${meeting.segment || "N/A"}`);
    sections.push(`Data: ${date}`);
    sections.push(`Versão do Prompt: ${meeting.promptVersion || "N/A"}`);
    sections.push("");

    // Scores
    sections.push("─".repeat(40));
    sections.push("SCORES");
    sections.push("─".repeat(40));
    if (analysis.scores) {
        sections.push(`  Estratégia:   ${analysis.scores.strategic ?? "—"}/10`);
        sections.push(`  Fechamento:   ${analysis.scores.closing ?? "—"}/10`);
        sections.push(`  Escuta Ativa: ${analysis.scores.listening ?? "—"}/10`);
    }
    sections.push("");

    // Participants
    if (analysis.participants?.length) {
        sections.push("─".repeat(40));
        sections.push("PARTICIPANTES");
        sections.push("─".repeat(40));
        for (const p of analysis.participants) {
            sections.push(`  • ${p.label} (${p.role})`);
        }
        sections.push("");
    }

    // DISC Profiles
    if (analysis.profiles?.length) {
        sections.push("─".repeat(40));
        sections.push("PERFIS DISC");
        sections.push("─".repeat(40));
        for (const p of analysis.profiles) {
            sections.push(`  ${p.participant}: ${p.disc} (confiança: ${p.confidence}%)`);
            if (p.evidence?.length) {
                for (const e of p.evidence) {
                    sections.push(`    → "${e}"`);
                }
            }
        }
        sections.push("");
    }

    // Structured Conversation
    if (analysis.structuredConversation?.length) {
        sections.push("─".repeat(40));
        sections.push("CONVERSA ESTRUTURADA");
        sections.push("─".repeat(40));
        for (const block of analysis.structuredConversation) {
            sections.push(`  [${block.block}]`);
            for (const h of block.highlights || []) {
                sections.push(`    • ${h}`);
            }
            if (block.keyQuotes?.length) {
                for (const q of block.keyQuotes) {
                    sections.push(`    📎 ${q.speaker}: "${q.quote}"`);
                }
            }
            sections.push("");
        }
    }

    // Strengths
    if (analysis.strengths?.length) {
        sections.push("─".repeat(40));
        sections.push("PONTOS FORTES");
        sections.push("─".repeat(40));
        for (const s of analysis.strengths) {
            sections.push(`  ✓ ${s}`);
        }
        sections.push("");
    }

    // Improvements
    if (analysis.improvements?.length) {
        sections.push("─".repeat(40));
        sections.push("PONTOS DE MELHORIA");
        sections.push("─".repeat(40));
        for (const s of analysis.improvements) {
            sections.push(`  → ${s}`);
        }
        sections.push("");
    }

    // Missed Opportunities
    if (analysis.missedOpportunities?.length) {
        sections.push("─".repeat(40));
        sections.push("OPORTUNIDADES PERDIDAS");
        sections.push("─".repeat(40));
        for (const s of analysis.missedOpportunities) {
            sections.push(`  ✗ ${s}`);
        }
        sections.push("");
    }

    // Next Meeting Plan
    if (analysis.nextMeetingPlan) {
        const plan = analysis.nextMeetingPlan;
        sections.push("─".repeat(40));
        sections.push("PLANO DA PRÓXIMA REUNIÃO");
        sections.push("─".repeat(40));
        sections.push(`  Objetivo: ${plan.goal}`);
        if (plan.strategy?.length) {
            sections.push("  Estratégia:");
            for (const s of plan.strategy) {
                sections.push(`    ▸ ${s}`);
            }
        }
        if (plan.questions?.length) {
            sections.push("  Perguntas Estratégicas:");
            for (let i = 0; i < plan.questions.length; i++) {
                sections.push(`    ${String(i + 1).padStart(2, "0")}. ${plan.questions[i]}`);
            }
        }
        if (plan.closingStrategy?.length) {
            sections.push("  Estratégia de Fechamento:");
            for (const s of plan.closingStrategy) {
                sections.push(`    🎯 ${s}`);
            }
        }
        sections.push("");
    }

    // Meta
    if (analysis.meta?.notes) {
        sections.push("─".repeat(40));
        sections.push("NOTAS");
        sections.push("─".repeat(40));
        sections.push(`  ${analysis.meta.notes}`);
        sections.push("");
    }

    sections.push("═".repeat(60));
    sections.push("Gerado por Strategic Mentor AI");
    sections.push(`${new Date().toLocaleString("pt-BR")}`);
    sections.push("═".repeat(60));

    const content = sections.join("\n");

    // Return as downloadable text file (universal, no heavy deps)
    const filename = `analise_${meeting.title.replace(/[^a-zA-Z0-9]/g, "_")}_${id.slice(0, 8)}.txt`;

    return new Response(content, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
