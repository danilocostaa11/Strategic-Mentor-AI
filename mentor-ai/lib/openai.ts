import OpenAI from "openai";

const apiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY?.trim()
  || process.env.OPENAI_API_KEY?.trim();

export const openai = new OpenAI({
  apiKey,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});
