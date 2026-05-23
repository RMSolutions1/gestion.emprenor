import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;
  console.log(JSON.stringify({ tables: tables.map((t) => t.tablename) }, null, 2));
}

main()
  .finally(() => prisma.$disconnect());
