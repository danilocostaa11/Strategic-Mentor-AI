/**
 * Adapter Turso/LibSQL para produção
 * Este arquivo é carregado apenas em runtime quando TURSO_DATABASE_URL está definido
 */

export function createTursoAdapter(tursoUrl: string, tursoToken: string) {
  const { PrismaLibSQL } = require("@prisma/adapter-libsql");
  const { createClient } = require("@libsql/client");

  const libsql = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });

  return new PrismaLibSQL(libsql);
}
