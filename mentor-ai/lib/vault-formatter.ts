// Formatters compartilhados entre export/[id]/route.ts (download manual)
// e github-vault.ts (auto-publish). Funções movidas pra cá em 2026-05-25
// pra evitar duplicação.

// R-AZ2 — segmentos que NÃO podem ser exportados ao vault de IA
// Visitas médicas AZ devem passar pelo processo de destilação manual
// (ver 13-playbooks/destilacao-licoes-venda.md no vault Segundo Cérebro)
export const PHARMA_SEGMENTS = new Set(["Pharma", "pharma", "Farma", "farma"]);

export function isPharmaSegment(segment?: string | null): boolean {
  if (!segment) return false;
  return PHARMA_SEGMENTS.has(segment);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function mapSegmentToArea(segment?: string | null): string {
  if (!segment) return "pessoal";
  const s = segment.toLowerCase();
  if (s.includes("imobil") || s.includes("yumida") || s.includes("incorporadora") || s.includes("investidor")) return "yumida";
  if (s.includes("clinic") || s.includes("medic") || s.includes("advoc") || s.includes("yumia") || s.includes("pme")) return "yumia";
  return "pessoal";
}

export function buildMarkdown(meeting: any, analysis: any, baseUrl: string): string {
  const clientName = meeting.client?.name || "Sem cliente";
  const clientSlug = meeting.client ? slugify(meeting.client.name) : "sem-cliente";
  const segment = meeting.segment || meeting.client?.segment || null;
  const area = mapSegmentToArea(segment);
  const date = new Date(meeting.createdAt);
  const dateISO = date.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const lines: string[] = [];

  lines.push("---");
  lines.push("tipo: reuniao");
  lines.push("status: processado");
  lines.push(`area: ${area}`);
  lines.push(`contato: ${clientSlug}`);
  lines.push("canal: reuniao");
  lines.push(`data: ${dateISO}`);
  lines.push("fonte: Mentor AI");
  lines.push(`fonte_url: ${baseUrl}/meetings/${meeting.id}`);
  lines.push("mentor_ai:");
  lines.push(`  meeting_id: ${meeting.id}`);
  if (meeting.promptVersion) lines.push(`  prompt_version: ${meeting.promptVersion}`);
  if (meeting.dealOutcome) lines.push(`  deal_outcome: ${meeting.dealOutcome}`);
  if (analysis.meetingStructure) lines.push(`  meeting_structure: ${analysis.meetingStructure}`);
  if (analysis.scores) {
    lines.push("  scores:");
    lines.push(`    estrategia: ${analysis.scores.strategic ?? "null"}`);
    lines.push(`    fechamento: ${analysis.scores.closing ?? "null"}`);
    lines.push(`    escuta_ativa: ${analysis.scores.listening ?? "null"}`);
  }
  const tags = ["mentor-ai-export"];
  if (segment) tags.push(slugify(segment));
  lines.push(`tags: [${tags.join(", ")}]`);
  lines.push(`criado_em: ${today}`);
  lines.push(`atualizado_em: ${today}`);
  lines.push("---");
  lines.push("");

  lines.push(`# ${meeting.title}`);
  lines.push("");

  lines.push("## Contexto");
  lines.push("");
  lines.push(`**Cliente:** ${clientName}`);
  if (segment) lines.push(`**Segmento:** ${segment}`);
  lines.push(`**Data:** ${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`);
  if (analysis.meetingStructure) lines.push(`**Estrutura da reunião:** ${analysis.meetingStructure}`);
  if (analysis.scores) {
    lines.push("");
    lines.push("**Scores:**");
    lines.push(`- Estratégia: ${analysis.scores.strategic ?? "—"}/10`);
    lines.push(`- Fechamento: ${analysis.scores.closing ?? "—"}/10`);
    lines.push(`- Escuta Ativa: ${analysis.scores.listening ?? "—"}/10`);
  }
  lines.push("");

  // v1.4+ — Mapeamento de nomes (atribuição explícita lado/team)
  if (analysis.nameMap?.length) {
    lines.push("## 🧭 Mapa de nomes (atribuição)");
    lines.push("");
    lines.push("| Nome | Lado | Time | Evidência |");
    lines.push("|------|------|------|-----------|");
    for (const n of analysis.nameMap) {
      const name = n.name || "—";
      const side = n.side || "—";
      const team = n.team || "—";
      const ev = (n.evidence || "").replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 80);
      lines.push(`| ${name} | ${side} | ${team} | ${ev ? `*"${ev}..."*` : "—"} |`);
    }
    lines.push("");
  }

  // v1.4+ — Correções de ASR aplicadas
  if (analysis.asrCorrections?.length) {
    lines.push("## 🔤 Correções ASR aplicadas");
    lines.push("");
    for (const c of analysis.asrCorrections) {
      const variants = (c.variants || []).join(", ");
      lines.push(`- **${c.canonical}** ← ${variants}`);
    }
    lines.push("");
  }

  if (analysis.participants?.length) {
    lines.push("## Participantes");
    lines.push("");
    for (const p of analysis.participants) {
      const team = p.team ? ` *(${p.team})*` : "";
      lines.push(`- **${p.label}** — ${p.role}${team}`);
    }
    lines.push("");
  }

  if (analysis.clientPositioning) {
    const cp = analysis.clientPositioning;
    const hasAny = cp.urgency || cp.price_sensitivity || cp.relationship_lean || cp.decision_authority || cp.bargaining_stance;
    if (hasAny) {
      lines.push("## 🎲 Posicionamento estratégico do cliente");
      lines.push("");
      lines.push("| Dimensão | Valor |");
      lines.push("|----------|-------|");
      if (cp.urgency) lines.push(`| Urgência | ${cp.urgency} |`);
      if (cp.price_sensitivity) lines.push(`| Sensibilidade a preço | ${cp.price_sensitivity} |`);
      if (cp.relationship_lean) lines.push(`| Inclinação relacional | ${cp.relationship_lean} |`);
      if (cp.decision_authority) lines.push(`| Autoridade de decisão | ${cp.decision_authority} |`);
      if (cp.bargaining_stance) lines.push(`| Postura de barganha | ${cp.bargaining_stance} |`);
      lines.push("");
      if (cp.evidence?.length) {
        lines.push("**Evidências:**");
        for (const e of cp.evidence) {
          lines.push(`> ${e}`);
        }
        lines.push("");
      }
    }
  }

  if (analysis.profiles?.length) {
    lines.push("## Perfis DISC");
    lines.push("");
    for (const p of analysis.profiles) {
      lines.push(`### ${p.participant} — ${p.disc} *(confiança: ${p.confidence}%)*`);
      lines.push("");
      if (p.evidence?.length) {
        for (const e of p.evidence) {
          lines.push(`> ${e}`);
        }
        lines.push("");
      }
    }
  }

  if (analysis.contextualFacts?.length) {
    lines.push("## 🧩 Fatos contextuais");
    lines.push("");
    lines.push("| Categoria | Fato | Evidência |");
    lines.push("|-----------|------|-----------|");
    for (const f of analysis.contextualFacts) {
      const cat = f.category || "—";
      const fact = (f.fact || "").replace(/\|/g, "\\|");
      const evidence = (f.evidence || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
      lines.push(`| ${cat} | ${fact} | ${evidence ? `*"${evidence.slice(0, 80)}${evidence.length > 80 ? "..." : ""}"*` : "—"} |`);
    }
    lines.push("");
  }

  if (analysis.structuredConversation?.length) {
    lines.push("## Conversa estruturada");
    lines.push("");
    for (const block of analysis.structuredConversation) {
      lines.push(`### ${block.block}`);
      lines.push("");
      if (block.highlights?.length) {
        for (const h of block.highlights) {
          lines.push(`- ${h}`);
        }
        lines.push("");
      }
      if (block.keyQuotes?.length) {
        for (const q of block.keyQuotes) {
          lines.push(`> **${q.speaker}:** "${q.quote}"`);
          lines.push("");
        }
      }
    }
  }

  if (analysis.strengths?.length) {
    lines.push("## 🎯 Pontos fortes");
    lines.push("");
    for (const s of analysis.strengths) {
      lines.push(`- ${s}`);
    }
    lines.push("");
  }

  if (analysis.improvements?.length) {
    lines.push("## ⚠️ Pontos de melhoria");
    lines.push("");
    for (const s of analysis.improvements) {
      lines.push(`- ${s}`);
    }
    lines.push("");
  }

  if (analysis.missedOpportunities?.length) {
    lines.push("## ✗ Oportunidades perdidas");
    lines.push("");
    for (const s of analysis.missedOpportunities) {
      lines.push(`- ${s}`);
    }
    lines.push("");
  }

  if (analysis.crossSellSignals?.length) {
    lines.push("## 🔁 Sinais de oportunidade paralela");
    lines.push("");
    for (const s of analysis.crossSellSignals) {
      lines.push(`### ${s.type || "sinal"}`);
      lines.push("");
      if (s.description) lines.push(`**O que apareceu:** ${s.description}`);
      if (s.evidence) lines.push(`> *"${s.evidence}"*`);
      if (s.action) lines.push(`**Próxima ação sugerida:** ${s.action}`);
      lines.push("");
    }
  }

  if (analysis.openCommitments?.length) {
    lines.push("## ✅ Compromissos abertos");
    lines.push("");
    lines.push("| Quem | O quê | Prazo | Evidência |");
    lines.push("|------|-------|-------|-----------|");
    for (const c of analysis.openCommitments) {
      const who = c.who || "—";
      const what = (c.what || "").replace(/\|/g, "\\|");
      const deadline = c.deadline || "indefinido";
      const evidence = (c.evidence || "").replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 70);
      lines.push(`| ${who} | ${what} | ${deadline} | ${evidence ? `*"${evidence}..."*` : "—"} |`);
    }
    lines.push("");
  }

  if (analysis.nextMeetingPlan) {
    const plan = analysis.nextMeetingPlan;
    lines.push("## 📋 Plano da próxima reunião");
    lines.push("");
    if (plan.goal) {
      lines.push(`**Objetivo:** ${plan.goal}`);
      lines.push("");
    }
    if (plan.strategy?.length) {
      lines.push("**Estratégia:**");
      for (const s of plan.strategy) {
        lines.push(`- ${s}`);
      }
      lines.push("");
    }
    if (plan.questions?.length) {
      lines.push("**Perguntas estratégicas:**");
      for (let i = 0; i < plan.questions.length; i++) {
        lines.push(`${i + 1}. ${plan.questions[i]}`);
      }
      lines.push("");
    }
    if (plan.closingStrategy?.length) {
      lines.push("**Estratégia de fechamento:**");
      for (const s of plan.closingStrategy) {
        lines.push(`- 🎯 ${s}`);
      }
      lines.push("");
    }
  }

  if (analysis.meta?.notes) {
    lines.push("## 📝 Notas");
    lines.push("");
    lines.push(analysis.meta.notes);
    lines.push("");
  }

  if (meeting.userFeedback) {
    lines.push("## Feedback do Danilo");
    lines.push("");
    lines.push(`> ${meeting.userFeedback}`);
    lines.push("");
  }

  lines.push("## Transcrição bruta");
  lines.push("");
  lines.push("```");
  lines.push(meeting.rawTranscript);
  lines.push("```");
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push(`*Exportado de [Mentor AI](${baseUrl}/meetings/${meeting.id}) em ${new Date().toISOString()}*`);

  return lines.join("\n");
}

export function buildPlainText(meeting: any, analysis: any): string {
  const clientName = meeting.client?.name || "Sem cliente";
  const date = new Date(meeting.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric"
  });

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

  sections.push("─".repeat(40));
  sections.push("SCORES");
  sections.push("─".repeat(40));
  if (analysis.scores) {
    sections.push(`  Estratégia:   ${analysis.scores.strategic ?? "—"}/10`);
    sections.push(`  Fechamento:   ${analysis.scores.closing ?? "—"}/10`);
    sections.push(`  Escuta Ativa: ${analysis.scores.listening ?? "—"}/10`);
  }
  sections.push("");

  if (analysis.participants?.length) {
    sections.push("─".repeat(40));
    sections.push("PARTICIPANTES");
    sections.push("─".repeat(40));
    for (const p of analysis.participants) {
      sections.push(`  • ${p.label} (${p.role})`);
    }
    sections.push("");
  }

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

  if (analysis.strengths?.length) {
    sections.push("─".repeat(40));
    sections.push("PONTOS FORTES");
    sections.push("─".repeat(40));
    for (const s of analysis.strengths) {
      sections.push(`  ✓ ${s}`);
    }
    sections.push("");
  }

  if (analysis.improvements?.length) {
    sections.push("─".repeat(40));
    sections.push("PONTOS DE MELHORIA");
    sections.push("─".repeat(40));
    for (const s of analysis.improvements) {
      sections.push(`  → ${s}`);
    }
    sections.push("");
  }

  if (analysis.missedOpportunities?.length) {
    sections.push("─".repeat(40));
    sections.push("OPORTUNIDADES PERDIDAS");
    sections.push("─".repeat(40));
    for (const s of analysis.missedOpportunities) {
      sections.push(`  ✗ ${s}`);
    }
    sections.push("");
  }

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

  return sections.join("\n");
}

// Resolve o path no vault Obsidian onde a nota deve ser gravada.
// Mapping fixo por área — Danilo pode mover manualmente depois pra
// pasta de projeto específico (ex: 20-yumida/negociacoes/quarteirao-aprigio-gonzaga/).
export function resolveVaultPath(meeting: any, analysis: any): string {
  const segment = meeting.segment || meeting.client?.segment || null;
  const area = mapSegmentToArea(segment);
  const date = new Date(meeting.createdAt).toISOString().slice(0, 10);
  const titleSlug = slugify(meeting.title || "reuniao") || meeting.id.slice(0, 8);
  const clientSlug = meeting.client ? slugify(meeting.client.name) : null;
  const filename = `${date}-${titleSlug}.md`;

  if (area === "yumida") {
    return `20-yumida/mentor-ai/${filename}`;
  }
  if (area === "yumia") {
    if (clientSlug) {
      return `05-vendas-e-prospeccao/leads/${clientSlug}/conversas/${filename}`;
    }
    return `05-vendas-e-prospeccao/mentor-ai/${filename}`;
  }
  return `11-inbox/mentor-ai/${filename}`;
}
