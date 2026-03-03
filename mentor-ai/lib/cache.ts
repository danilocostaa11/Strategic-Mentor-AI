import { createHash } from "crypto";

const analysisCache = new Map<string, any>();

export function getCacheKey(transcript: string, segment: string, promptVersion: string): string {
  const hash = createHash("md5")
    .update(transcript)
    .digest("hex");
  return `${hash}-${segment}-${promptVersion}`;
}

export function getCached(key: string): any | null {
  return analysisCache.get(key) ?? null;
}

export function setCache(key: string, value: any): void {
  analysisCache.set(key, value);
}

export function clearCache(): void {
  analysisCache.clear();
}

export function cacheSize(): number {
  return analysisCache.size;
}
