import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;
  const models = [
    "organization",
    "user",
    "project",
    "projectMaterial",
    "projectLedgerEntry",
    "siteLogEntry",
    "workExtra",
    "worker",
    "vehicle",
    "document",
    "workOrder",
    "permitToWork",
    "safetyInspection",
    "technicalReport",
    "qualityNonConformance",
    "hseIncident",
    "notification",
  ];
  const counts = {};
  for (const m of models) {
    try {
      counts[m] = await prisma[m].count();
    } catch (e) {
      counts[m] = `error: ${e.message}`;
    }
  }
  console.log(JSON.stringify({ tables, counts }, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
