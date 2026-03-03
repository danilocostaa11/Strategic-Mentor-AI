import { openai } from "./openai";
import { buildIndividualPrompt, buildPatternsPrompt } from "./prompts";
import { loadPlaybooks } from "./playbook";

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

export async function analyzeMeeting(args: {
  transcript: string;
  segment?: string | null;
  clientContext?: string | null;
}) {
  const { negotiation, communication } = loadPlaybooks();

  const prompt = buildIndividualPrompt({
    negotiationPlaybook: negotiation,
    communicationPlaybook: communication,
    transcript: args.transcript,
    segment: args.segment,
    clientContext: args.clientContext,
  });

  const resp = await openai.chat.completions.create({
    model: "gpt-5.2-mini",
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
  const { negotiation, communication } = loadPlaybooks();

  const prompt = buildPatternsPrompt({
    negotiationPlaybook: negotiation,
    communicationPlaybook: communication,
    analysesJsonArray: JSON.stringify(args.analyses),
    segment: args.segment,
  });

  const resp = await openai.chat.completions.create({
    model: "gpt-5.2-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: "Você responde somente em JSON válido." },
      { role: "user", content: prompt },
    ],
  });

  const text = resp.choices[0]?.message?.content ?? "";
  return safeJsonParse(text);
}
