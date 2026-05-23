import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ping = await prisma.$queryRaw<
    { connection_test: number; db_name: string }[]
  >`SELECT 1 AS connection_test, current_database() AS db_name`;

  const users = await prisma.user.findMany({
    select: { email: true, role: true, name: true },
    orderBy: { email: "asc" },
  });

  console.log(
    JSON.stringify(
      { ok: true, database: ping[0], users },
      (_, v) => (typeof v === "bigint" ? Number(v) : v),
      2
    )
  );
}

main()
  .catch((err: Error) => {
    console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
