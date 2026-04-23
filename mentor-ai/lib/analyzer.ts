import { openai } from "./openai";
import { buildIndividualPrompt, buildPatternsPrompt, PROMPT_VERSION, getPromptHash } from "./prompts";
import { buildContext } from "./playbook";
import { getCacheKey, getCached, setCache } from "./cache";

const PRIMARY_MODEL = process.env.AI_MODEL_PRIMARY?.trim() || "gemini-2.5-pro";
const FALLBACK_MODEL = process.env.AI_MODEL_FALLBACK?.trim() || "gemini-2.5-flash";

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = text.slice(start, end + 1);
      return JSON.parse(slice);
    }
    throw new Error("Resposta não é JSON válido.");
  }
}

function isRateLimitError(error: any): boolean {
  return error?.status === 429 || error?.code === "rate_limit_exceeded";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorCode(error: any): string | null {
  return error?.code ?? error?.error?.code ?? error?.type ?? error?.error?.type ?? null;
}

function shouldUseFallbackModel(error: any): boolean {
  const code = getErrorCode(error);
  return code === "insufficient_quota" || code === "model_not_found" || code === "invalid_model";
}

async function createChatCompletion(args: {
  system: string;
  prompt: string;
  maxTokens: number;
}): Promise<{ text: string; modelUsed: string; usedFallback: boolean }> {
  const call = async (model: string) => {
    const resp = await openai.chat.completions.create({
      model,
      temperature: 0.1,
      max_tokens: args.maxTokens,
      messages: [
        { role: "system", content: args.system },
        { role: "user", content: args.prompt },
      ],
    });

    return resp.choices[0]?.message?.content ?? "";
  };

  try {
    const text = await call(PRIMARY_MODEL);
    return { text, modelUsed: PRIMARY_MODEL, usedFallback: false };
  } catch (error: any) {
    if (!shouldUseFallbackModel(error) || !FALLBACK_MODEL || FALLBACK_MODEL === PRIMARY_MODEL) {
      throw error;
    }
    const text = await call(FALLBACK_MODEL);
    return { text, modelUsed: FALLBACK_MODEL, usedFallback: true };
  }
}

export interface AnalyzeResult {
  analysis: any;
  promptVersion: string;
  promptHash: string;
  fromCache: boolean;
  modelUsed?: string;
  usedFallback?: boolean;
}

export async function analyzeMeeting(args: {
  transcript: string;
  segment?: string | null;
  clientContext?: string | null;
}): Promise<AnalyzeResult> {
  const context = buildContext(args.segment);

  const prompt = buildIndividualPrompt({
    context,
    transcript: args.transcript,
    segment: args.segment,
    clientContext: args.clientContext,
  });

  const promptHash = getPromptHash(prompt);
  const cacheKey = getCacheKey(args.transcript, args.segment ?? "default", PROMPT_VERSION);

  const cached = getCached(cacheKey);
  if (cached) {
    return {
      analysis: cached,
      promptVersion: PROMPT_VERSION,
      promptHash,
      fromCache: true,
    };
  }

  let analysis: any;
  let modelUsed: string | undefined;
  let usedFallback: boolean | undefined;

  try {
    ({ analysis, modelUsed, usedFallback } = await callOpenAI(prompt));
  } catch (error: any) {
    if (isRateLimitError(error)) {
      await sleep(2000);
      ({ analysis, modelUsed, usedFallback } = await callOpenAI(prompt));
    } else {
      throw error;
    }
  }

  setCache(cacheKey, analysis);

  return {
    analysis,
    promptVersion: PROMPT_VERSION,
    promptHash,
    fromCache: false,
    modelUsed,
    usedFallback,
  };
}

async function callOpenAI(prompt: string): Promise<{ analysis: any; modelUsed: string; usedFallback: boolean }> {
  const { text, modelUsed, usedFallback } = await createChatCompletion({
    system: `Você é um analista preciso de reuniões comerciais. Responda SOMENTE em JSON válido.

REGRAS INVIOLÁVEIS:
- NUNCA invente informações que não estão na transcrição.
- Todas as citações devem ser trechos EXATOS da transcrição original.
- Se não há evidência suficiente, diga "Insuficiente na transcrição" — NUNCA preencha com conteúdo genérico.
- Pontos fortes, melhorias e oportunidades devem ser ESPECÍFICOS e rastreáveis à transcrição.
- Scores devem refletir EVIDÊNCIAS REAIS. Sem evidência = score baixo.`,
    prompt,
    maxTokens: 4000,
  });
  return { analysis: safeJsonParse(text), modelUsed, usedFallback };
}

export async function analyzePatterns(args: {
  analyses: any[];
  segment?: string | null;
}) {
  const context = buildContext(args.segment);

  const prompt = buildPatternsPrompt({
    context,
    analysesJsonArray: JSON.stringify(args.analyses),
    segment: args.segment,
  });

  try {
    const { text } = await createChatCompletion({
      system: "Você é um analista de padrões de performance comercial. Responda SOMENTE em JSON válido.",
      prompt,
      maxTokens: 4000,
    });
    return JSON.parse(text || "{}");
  } catch (error: any) {
    if (isRateLimitError(error)) {
      await sleep(2000);
      const { analysis } = await callOpenAI(prompt);
      return analysis;
    }
    throw error;
  }
}
