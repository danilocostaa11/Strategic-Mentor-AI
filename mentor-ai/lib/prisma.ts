import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  // Produção: Turso (LibSQL)
  const normalizeEnv = (value?: string) => {
    const normalized = value?.trim();
    if (!normalized) return undefined;
    if (normalized.toLowerCase() === "undefined") return undefined;
    if (normalized.toLowerCase() === "null") return undefined;
    return normalized;
  };

  const tursoUrl = normalizeEnv(process.env.TURSO_DATABASE_URL);
  const tursoAuthToken = normalizeEnv(process.env.TURSO_AUTH_TOKEN);
  const databaseUrl = normalizeEnv(process.env.DATABASE_URL);

  if (tursoUrl && tursoAuthToken) {
    // Prisma still reads DATABASE_URL even when using driver adapters.
    if (!databaseUrl) process.env.DATABASE_URL = tursoUrl;

    const { PrismaLibSQL } = require("@prisma/adapter-libsql");

    return new PrismaClient({
      adapter: new PrismaLibSQL({
        // Defensive trim: avoids failures when env vars contain trailing newlines.
        url: tursoUrl,
        authToken: tursoAuthToken,
      }),
    } as any);
  }

  // Desenvolvimento: SQLite local
  return new PrismaClient({
    log: ["error", "warn"],
  });
}

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
