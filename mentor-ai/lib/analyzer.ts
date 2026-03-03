import { openai } from "./openai";
import { buildIndividualPrompt, buildPatternsPrompt, PROMPT_VERSION, getPromptHash } from "./prompts";
import { buildContext } from "./playbook";
import { getCacheKey, getCached, setCache } from "./cache";

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

export interface AnalyzeResult {
  analysis: any;
  promptVersion: string;
  promptHash: string;
  fromCache: boolean;
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

  try {
    analysis = await callOpenAI(prompt);
  } catch (error: any) {
    if (isRateLimitError(error)) {
      await sleep(2000);
      analysis = await callOpenAI(prompt);
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
  };
}

async function callOpenAI(prompt: string): Promise<any> {
  const resp = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    messages: [
      { role: "system", content: "Você responde somente em JSON válido." },
      { role: "user", content: prompt },
    ],
  });

  const text = resp.choices[0]?.message?.content ?? "";
  return safeJsonParse(text);
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
    return await callOpenAI(prompt);
  } catch (error: any) {
    if (isRateLimitError(error)) {
      await sleep(2000);
      return await callOpenAI(prompt);
    }
    throw error;
  }
}
