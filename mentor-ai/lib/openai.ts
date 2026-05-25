import OpenAI from "openai";

const apiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY?.trim()
  || process.env.OPENAI_API_KEY?.trim();

const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL?.trim() || undefined;

console.log(`[openai:config] apiKey present=${!!apiKey}, baseURL=${baseURL || "(default OpenAI)"}`);

export const openai = new OpenAI({
  apiKey,
  baseURL,
});
