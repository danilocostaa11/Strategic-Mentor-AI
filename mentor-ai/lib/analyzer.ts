import { openai } from "./openai";
import { buildIndividualPrompt, buildPatternsPrompt, PROMPT_VERSION, getPromptHash } from "./prompts";
import { buildContext } from "./playbook";
import { getCacheKey, getCached, setCache } from "./cache";

const PRIMARY_MODEL = process.env.AI_MODEL_PRIMARY?.trim() || "gemini-2.5-pro";
const FALLBACK_MODEL = process.env.AI_MODEL_FALLBACK?.trim() || "gemini-2.5-flash";

console.log(`[analyzer:models] Primary=${PRIMARY_MODEL}, Fallback=${FALLBACK_MODEL}`);

function safeJsonParse(text: string) {
  console.log(`[analyzer:safeJsonParse] Input text length=${text.length}, firstChars=${text.substring(0, 100).replace(/\n/g, "\\n")}`);
  try {
    const result = JSON.parse(text);
    console.log(`[analyzer:safeJsonParse] Parsed successfully`);
    return result;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = text.slice(start, end + 1);
      console.log(`[analyzer:safeJsonParse] Trying to extract JSON from index ${start} to ${end}, slice length=${slice.length}`);
      try {
        const result = JSON.parse(slice);
        console.log(`[analyzer:safeJsonParse] Extracted JSON successfully`);
        return result;
      } catch (extractErr: any) {
        console.error(`[analyzer:safeJsonParse] Extraction failed: ${extractErr.message}`);
        throw new Error(`Resposta não é JSON válido. Extract attempt failed: ${extractErr.message}`);
      }
    }
    console.error(`[analyzer:safeJsonParse] No JSON object found in text`);
    throw new Error(`Resposta não é JSON válido. No JSON object found in ${text.length} chars.`);
  }
}

function isRateLimitError(error: any): boolean {
  return error?.status === 429 || error?.code === "rate_limit_exceeded";
}

/**
 * Detects the Google Gemini spending cap error (monthly limit exceeded).
 * This is a 429 with RESOURCE_EXHAUSTED status — NOT a transient rate limit.
 * Retrying won't help; user needs to increase the spending cap.
 */
function isSpendingCapError(error: any): boolean {
  const message = (error?.message ?? error?.error?.message ?? "").toLowerCase();
  const status = error?.error?.status ?? error?.status_text ?? "";
  return (
    (error?.status === 429 || error?.code === 429) &&
    (message.includes("spending cap") ||
     message.includes("spend cap") ||
     status === "RESOURCE_EXHAUSTED")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorCode(error: any): string | null {
  return error?.code ?? error?.error?.code ?? error?.type ?? error?.error?.type ?? null;
}

function shouldUseFallbackModel(error: any): boolean {
  // Don't try fallback if spending cap exceeded — same project, same limit.
  if (isSpendingCapError(error)) return false;
  const code = getErrorCode(error);
  return code === "insufficient_quota" || code === "model_not_found" || code === "invalid_model";
}

async function createChatCompletion(args: {
  system: string;
  prompt: string;
  maxTokens: number;
}): Promise<{ text: string; modelUsed: string; usedFallback: boolean }> {
  const call = async (model: string) => {
    console.log(`[analyzer:createChatCompletion] Calling model=${model}, maxTokens=${args.maxTokens}`);
    const resp = await openai.chat.completions.create({
      model,
      temperature: 0.1,
      max_tokens: args.maxTokens,
      messages: [
        { role: "system", content: args.system },
        { role: "user", content: args.prompt },
      ],
    });

    const text = resp.choices[0]?.message?.content ?? "";
    console.log(`[analyzer:createChatCompletion] Response received, text length=${text.length}, finish_reason=${resp.choices[0]?.finish_reason}`);
    if (!text || text.trim().length === 0) {
      throw new Error(`Resposta vazia do modelo ${model}. finish_reason=${resp.choices[0]?.finish_reason}`);
    }
    return text;
  };

  try {
    const text = await call(PRIMARY_MODEL);
    return { text, modelUsed: PRIMARY_MODEL, usedFallback: false };
  } catch (error: any) {
    console.error(`[analyzer:createChatCompletion] Primary model ${PRIMARY_MODEL} failed:`, error.message || error);
    if (!shouldUseFallbackModel(error) || !FALLBACK_MODEL || FALLBACK_MODEL === PRIMARY_MODEL) {
      throw error;
    }
    console.log(`[analyzer:createChatCompletion] Trying fallback model ${FALLBACK_MODEL}...`);
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
  console.log(`[analyzer:analyzeMeeting] Starting analysis, transcript length=${args.transcript.length}, segment=${args.segment || "null"}`);

  const context = buildContext(args.segment);

  const prompt = buildIndividualPrompt({
    context,
    transcript: args.transcript,
    segment: args.segment,
    clientContext: args.clientContext,
  });

  console.log(`[analyzer:analyzeMeeting] Prompt built, length=${prompt.length}`);

  const promptHash = getPromptHash(prompt);
  const cacheKey = getCacheKey(args.transcript, args.segment ?? "default", PROMPT_VERSION);

  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[analyzer:analyzeMeeting] Cache hit for key=${cacheKey.substring(0, 20)}...`);
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
    console.error(`[analyzer:analyzeMeeting] callOpenAI failed: ${error.message || error}`);
    // Spending cap error — don't retry, propagate immediately with clear message.
    if (isSpendingCapError(error)) {
      const err = new Error(
        "Limite de gasto mensal da API Gemini atingido. Acesse https://ai.studio/spend para ajustar seu limite."
      );
      (err as any).code = "spending_cap_exceeded";
      (err as any).status = 429;
      throw err;
    }
    // Transient rate limit — single retry after backoff.
    if (isRateLimitError(error)) {
      console.log(`[analyzer:analyzeMeeting] Rate limit detected, retrying after 2s...`);
      await sleep(2000);
      ({ analysis, modelUsed, usedFallback } = await callOpenAI(prompt));
    } else {
      throw error;
    }
  }

  setCache(cacheKey, analysis);

  console.log(`[analyzer:analyzeMeeting] Analysis complete, modelUsed=${modelUsed}, usedFallback=${usedFallback}`);

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
  console.log(`[analyzer:callOpenAI] Starting OpenAI call, prompt length=${prompt.length}`);
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
  console.log(`[analyzer:callOpenAI] Parsing response text (length=${text.length})...`);
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
