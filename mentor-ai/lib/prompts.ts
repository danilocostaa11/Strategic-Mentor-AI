import { createHash } from "crypto";

export const PROMPT_VERSION = "v1.1-2026-03";

let _promptHashCache: string | null = null;

export function getPromptHash(promptContent: string): string {
  return createHash("md5").update(promptContent).digest("hex").slice(0, 12);
}

export function getBasePromptHash(): string {
  if (_promptHashCache) return _promptHashCache;
  const template = INDIVIDUAL_TEMPLATE_SIGNATURE;
  _promptHashCache = getPromptHash(template);
  return _promptHashCache;
}

const INDIVIDUAL_TEMPLATE_SIGNATURE = "strategic-mentor-individual-v1.1";

const SCORING_RUBRIC = `
=== RUBRICA DE SCORES (use como referência obrigatória) ===

Strategic Score (0–10):
- 0–3: Reunião sem estrutura, sem diagnóstico
- 4–5: Estrutura parcial, diagnóstico superficial
- 6–7: Boa condução, pontos de melhoria claros
- 8–9: Reunião estratégica, adaptação ao perfil
- 10: Referência: todos os blocos executados com excelência

Closing Score (0–10):
- 0–3: Sem tentativa de fechamento
- 4–5: Fechamento fraco, sem comprometimento
- 6–7: Fechamento presente, timing questionável
- 8–9: Fechamento técnico, adequado ao perfil
- 10: Compromisso claro + próximos passos + data
`;

export function buildIndividualPrompt(args: {
  context: string;
  transcript: string;
  segment?: string | null;
  clientContext?: string | null;
}) {
  const { context, transcript, segment, clientContext } = args;

  return `
Você é um Mentor Estratégico de Performance Comercial (equilibrado: método + psicologia).
Você deve seguir os PLAYBOOKS abaixo como referência principal (a "lei da casa").

=== PLAYBOOKS E CONTEXTO DE SEGMENTO ===
${context}

=== CONTEXTO DO CLIENTE (se houver) ===
Segmento: ${segment ?? "N/A"}
Cliente (contexto cadastrado): ${clientContext ?? "N/A"}

${SCORING_RUBRIC}

=== TAREFA ===
Analise a transcrição bruta. Ela pode estar desorganizada e misturar quebra-gelo e assunto técnico.

Regras:
1) Identifique participantes e separe falas:
   - CONSULTOR
   - CLIENTE_1, CLIENTE_2, CLIENTE_3 (se houver)
   - Para cada CLIENTE_n, inferir papel: decisor / influenciador / técnico / observador (se possível).
2) Reorganize a conversa em blocos:
   - RAPPORT
   - TRANSIÇÃO
   - DIAGNÓSTICO
   - DORES
   - ARGUMENTAÇÃO
   - OBJEÇÕES
   - AVANÇO/FECHAMENTO
   - ENCERRAMENTO
3) Classifique PERFIL (DISC) por participante cliente:
   Analítico / Integrador / Expressivo / Pragmático
   - inclua confiança (0-100)
   - inclua evidências (trechos curtos, sem inventar)
4) Avalie o CONSULTOR:
   - condução estratégica (reativo vs conduzindo)
   - escuta ativa (perguntas abertas, validação, espaço para o outro)
   - estilo de comunicação predominante (analítico/amigável/autoritário/expressivo)
   - adequação ao perfil do(s) cliente(s)
   - qualidade de abertura (primeiros 5s)
   - fechamento (CTA + próximo passo claro)
5) Gere recomendações práticas para o próximo encontro (consultivo e orientado a fechamento).
6) Atribua os scores seguindo RIGOROSAMENTE a rubrica acima.

=== FORMATO DE SAÍDA (OBRIGATÓRIO) ===
Responda SOMENTE com JSON válido exatamente neste schema:

{
  "participants": [
    { "label": "CONSULTOR", "role": "consultor" },
    { "label": "CLIENTE_1", "role": "decisor|influenciador|tecnico|observador|indefinido" }
  ],
  "structuredConversation": [
    { "block": "RAPPORT|TRANSIÇÃO|DIAGNÓSTICO|DORES|ARGUMENTAÇÃO|OBJEÇÕES|AVANÇO/FECHAMENTO|ENCERRAMENTO",
      "highlights": ["bullets curtos"],
      "keyQuotes": [{ "speaker": "CONSULTOR|CLIENTE_1|CLIENTE_2", "quote": "trecho curto" }]
    }
  ],
  "profiles": [
    { "participant": "CLIENTE_1",
      "disc": "Analítico|Integrador|Expressivo|Pragmático|Indefinido",
      "confidence": 0,
      "evidence": ["trechos curtos"]
    }
  ],
  "scores": {
    "strategic": 0,
    "closing": 0,
    "listening": 0
  },
  "strengths": ["3-6 itens"],
  "improvements": ["3-6 itens"],
  "missedOpportunities": ["2-6 itens"],
  "nextMeetingPlan": {
    "goal": "objetivo claro",
    "strategy": ["3-6 bullets"],
    "questions": ["5-12 perguntas estratégicas"],
    "closingStrategy": ["3-6 bullets"]
  },
  "meta": {
    "segment": "${segment ?? ""}",
    "promptVersion": "${PROMPT_VERSION}",
    "notes": "se houver ambiguidade, descreva aqui sem inventar"
  }
}

=== TRANSCRIÇÃO ===
${transcript}
`.trim();
}

export function buildPatternsPrompt(args: {
  context: string;
  analysesJsonArray: string;
  segment?: string | null;
}) {
  const { context, analysesJsonArray, segment } = args;

  return `
Você é um Mentor Estratégico de Performance Comercial.
Use os PLAYBOOKS como referência. Analise padrões recorrentes do CONSULTOR ao longo de várias reuniões.

=== PLAYBOOKS E CONTEXTO ===
${context}

Segmento: ${segment ?? "N/A"}

Entrada: uma lista de análises anteriores (JSON). Não invente nada além do que está ali.

=== SAÍDA (SOMENTE JSON) ===
{
  "summary": "resumo geral em 3-6 linhas",
  "recurringStrengths": ["3-8 itens"],
  "recurringWeaknesses": ["3-10 itens"],
  "closingPatterns": ["2-8 itens"],
  "listeningPatterns": ["2-8 itens"],
  "profilePerformance": [
    { "disc": "Analítico|Integrador|Expressivo|Pragmático", "trend": "melhor|pior|misto", "notes": "curto" }
  ],
  "evolution": {
    "trend": "melhorando|estável|piorando|indefinido",
    "evidence": ["pontos objetivos"]
  },
  "plan30Days": {
    "focus": ["3-6 focos"],
    "microHabits": ["5-12 micro-hábitos"],
    "weeklyDrills": ["2-6 exercícios semanais"],
    "checklistBeforeMeeting": ["5-10 itens"],
    "checklistAfterMeeting": ["5-10 itens"]
  },
  "alertTriggered": false,
  "alertMessage": ""
}

=== ANALYSES_JSON_ARRAY ===
${analysesJsonArray}
`.trim();
}
