/**
 * Auditoria de esquema Neon — tablas y conteos
 * Uso: npx dotenv -e .env.local --override -- node scripts/neon-schema-audit.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const models = [
  "organization",
  "user",
  "clientProfile",
  "project",
  "projectAssignment",
  "document",
  "worker",
  "vehicle",
  "workExtra",
  "projectLedgerEntry",
  "siteLogEntry",
  "chatChannel",
  "chatMessage",
  "notification",
];

async function main() {
  const ping = await prisma.$queryRaw`SELECT 1 AS ok, current_database() AS db`;
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;

  const counts = {};
  for (const m of models) {
    try {
      counts[m] = await prisma[m].count();
    } catch (e) {
      counts[m] = `error: ${e.message}`;
    }
  }

  const users = await prisma.user.count();
  const projects = await prisma.project.count();

  console.log(
    JSON.stringify(
      {
        ok: true,
        database: ping[0],
        tablesInPg: tables.length,
        tableNames: tables.map((t) => t.tablename),
        sampleCounts: counts,
        users,
        projects,
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(JSON.stringify({ ok: false, error: e.message }, null, 2));
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
