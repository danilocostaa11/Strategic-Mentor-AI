import { createHash } from "crypto";

export const PROMPT_VERSION = "v1.2-2026-03";

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

const INDIVIDUAL_TEMPLATE_SIGNATURE = "strategic-mentor-individual-v1.2";

const SCORING_RUBRIC = `
=== RUBRICA DE SCORES (use como referência obrigatória) ===

Strategic Score (0–10):
- 0–3: Reunião sem estrutura, sem diagnóstico, conversa solta
- 4–5: Estrutura parcial, diagnóstico superficial
- 6–7: Boa condução, pontos de melhoria claros
- 8–9: Reunião estratégica, adaptação ao perfil
- 10: Referência: todos os blocos executados com excelência

Closing Score (0–10):
- 0–3: Sem tentativa de fechamento, sem próximos passos
- 4–5: Fechamento fraco, sem comprometimento claro
- 6–7: Fechamento presente, timing questionável
- 8–9: Fechamento técnico, adequado ao perfil
- 10: Compromisso claro + próximos passos + data definida

Listening Score (0-10):
- 0–3: Consultor monopoliza a fala, não faz perguntas
- 4–5: Algumas perguntas, mas não aprofunda respostas
- 6–7: Faz perguntas abertas, mas poderia ouvir mais
- 8–9: Escuta ativa evidente, parafraseia, valida
- 10: Equilíbrio perfeito, cliente fala mais, consultor conduz com perguntas
`;

const ANTI_HALLUCINATION_RULES = `
=== REGRAS CRÍTICAS (ANTI-ALUCINAÇÃO) ===
ATENÇÃO: Estas regras são INVIOLÁVEIS. Quebrá-las invalida toda a análise.

1) SOMENTE analise o que REALMENTE está na transcrição. NÃO invente, NÃO assuma, NÃO complete lacunas.
2) Se um bloco da conversa (ex: OBJEÇÕES) NÃO aparece na transcrição, escreva "Não identificado na transcrição" nos highlights.
3) Todas as citações em "keyQuotes" DEVEM ser trechos REAIS da transcrição. Copie literalmente. Se não há citação relevante, deixe o array vazio [].
4) Todas as "evidence" nos perfis DISC DEVEM ser trechos literais da transcrição.
5) Se o perfil DISC não pode ser determinado com clareza, use "Indefinido" com confidence baixa e explique no campo evidence.
6) Os pontos em "strengths", "improvements" e "missedOpportunities" devem se referir a EVENTOS CONCRETOS da transcrição, não a conceitos genéricos.
   - ERRADO: "Boa construção de rapport" (genérico)
   - CERTO: "Consultor mencionou o time de futebol do cliente, criando conexão pessoal" (específico)
7) Se a transcrição é informal, desorganizada ou curta, reflita isso nos scores. Uma conversa sem estrutura deve ter score baixo.
8) NÃO use frases genéricas de manual. Cada ponto deve ser rastreável a um trecho específico da transcrição.
9) Se não há informação suficiente para preencher um campo, diga "Insuficiente na transcrição" em vez de inventar.
10) O campo "meta.notes" deve listar QUALQUER limitação encontrada (ex: "transcrição curta", "falas misturadas sem identificação clara").
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
Sua tarefa é analisar transcrições REAIS de reuniões comerciais.

${ANTI_HALLUCINATION_RULES}

=== PLAYBOOKS (referência para avaliação, NÃO para fabricar conteúdo) ===
${context}

=== CONTEXTO DO CLIENTE (se houver) ===
Segmento: ${segment ?? "N/A"}
Cliente (contexto cadastrado): ${clientContext ?? "N/A"}

${SCORING_RUBRIC}

=== TAREFA ===
Analise a transcrição bruta abaixo. Ela pode estar desorganizada, informal, com gírias, e misturar quebra-gelo e assunto técnico.

IMPORTANTE: Sua análise deve ser um ESPELHO FIEL do que aconteceu na reunião, não um relatório genérico.

Regras de análise:
1) Identifique participantes e separe falas:
   - CONSULTOR (quem está vendendo/apresentando)
   - CLIENTE_1, CLIENTE_2, CLIENTE_3 (quem está recebendo/comprando)
   - Se não é possível distinguir claramente os participantes, explique no campo meta.notes
   - Para cada CLIENTE_n, inferir papel: decisor / influenciador / técnico / observador (se possível). Se não for possível, use "indefinido".

2) Reorganize a conversa nos blocos abaixo. SOMENTE inclua blocos que REALMENTE existem na transcrição:
   - RAPPORT
   - TRANSIÇÃO
   - DIAGNÓSTICO
   - DORES
   - ARGUMENTAÇÃO
   - OBJEÇÕES
   - AVANÇO/FECHAMENTO
   - ENCERRAMENTO
   Se um bloco não existir na transcrição, inclua-o com highlights: ["Não identificado na transcrição"].

3) Classifique PERFIL (DISC) por participante cliente:
   Analítico / Integrador / Expressivo / Pragmático / Indefinido
   - SEMPRE tente classificar com base em evidências comportamentais da transcrição
   - Analítico: pede dados, números, estudos, é metódico, preciso
   - Integrador: valoriza relações, é acolhedor, decide em grupo, busca consenso
   - Expressivo: entusiasmado, reage com emoção, usa exclamações, fala bastante
   - Pragmático: direto, objetivo, foco em resultado, pouco tempo para conversa fiada
   - Use "Indefinido" SOMENTE se não há NENHUMA pista comportamental
   - inclua confiança (0-100): 20-40 se poucas pistas, 40-70 se evidência moderada, 70-100 se evidência clara
   - inclua evidências que são TRECHOS LITERAIS da transcrição (copie exatamente)

4) Avalie o CONSULTOR baseado NO QUE REALMENTE FEZ na transcrição:
   - condução estratégica (reativo vs conduzindo) — cite exemplos reais
   - escuta ativa (perguntas abertas feitas, validações, espaço dado)
   - estilo de comunicação predominante
   - adequação ao perfil do(s) cliente(s)
   - qualidade de abertura
   - fechamento (houve CTA? Próximo passo? Data?)

5) Gere recomendações práticas para o próximo encontro baseadas nas LACUNAS REAIS observadas.

6) Atribua os scores seguindo RIGOROSAMENTE a rubrica acima. Scores altos exigem evidência na transcrição.

=== FORMATO DE SAÍDA (OBRIGATÓRIO — JSON válido) ===

{
  "participants": [
    { "label": "CONSULTOR", "role": "consultor" },
    { "label": "CLIENTE_1", "role": "decisor|influenciador|tecnico|observador|indefinido" }
  ],
  "structuredConversation": [
    { "block": "RAPPORT|TRANSIÇÃO|DIAGNÓSTICO|DORES|ARGUMENTAÇÃO|OBJEÇÕES|AVANÇO/FECHAMENTO|ENCERRAMENTO",
      "highlights": ["bullets curtos e ESPECÍFICOS sobre o que aconteceu"],
      "keyQuotes": [{ "speaker": "CONSULTOR|CLIENTE_1", "quote": "trecho LITERAL da transcrição" }]
    }
  ],
  "profiles": [
    { "participant": "CLIENTE_1",
      "disc": "Analítico|Integrador|Expressivo|Pragmático|Indefinido",
      "confidence": 0,
      "evidence": ["trechos LITERAIS da transcrição que justificam o perfil"]
    }
  ],
  "scores": {
    "strategic": 0,
    "closing": 0,
    "listening": 0
  },
  "strengths": ["3-6 itens ESPECÍFICOS com referência ao que aconteceu na transcrição"],
  "improvements": ["3-6 itens ESPECÍFICOS com base em lacunas REAIS observadas"],
  "missedOpportunities": ["2-6 momentos CONCRETOS em que o consultor poderia ter agido diferente"],
  "nextMeetingPlan": {
    "goal": "objetivo claro baseado no estado atual da negociação",
    "strategy": ["3-6 bullets"],
    "questions": ["5-12 perguntas estratégicas relevantes ao contexto desta reunião"],
    "closingStrategy": ["3-6 bullets"]
  },
  "meta": {
    "segment": "${segment ?? ""}",
    "promptVersion": "${PROMPT_VERSION}",
    "notes": "Liste TODAS as limitações: transcrição curta, falas misturadas, contexto incompleto, etc."
  }
}

=== TRANSCRIÇÃO BRUTA (analise SOMENTE isto) ===
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

REGRA CRÍTICA: Baseie sua análise SOMENTE nos dados fornecidos. NÃO invente padrões que não existem nos dados.

=== PLAYBOOKS E CONTEXTO ===
${context}

Segmento: ${segment ?? "N/A"}

Entrada: uma lista de análises anteriores (JSON). Não invente nada além do que está ali.

=== SAÍDA (SOMENTE JSON) ===
{
  "summary": "resumo geral em 3-6 linhas baseado nos dados reais",
  "recurringStrengths": ["3-8 itens que aparecem em MÚLTIPLAS análises"],
  "recurringWeaknesses": ["3-10 itens que aparecem em MÚLTIPLAS análises"],
  "closingPatterns": ["2-8 itens baseados nos dados"],
  "listeningPatterns": ["2-8 itens baseados nos dados"],
  "profilePerformance": [
    { "disc": "Analítico|Integrador|Expressivo|Pragmático", "trend": "melhor|pior|misto", "notes": "curto" }
  ],
  "evolution": {
    "trend": "melhorando|estável|piorando|indefinido",
    "evidence": ["pontos objetivos extraídos dos dados"]
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
