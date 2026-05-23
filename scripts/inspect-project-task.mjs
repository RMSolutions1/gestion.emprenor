import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const cols = await p.$queryRaw`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'ProjectTask'
  ORDER BY ordinal_position
`;
let count = 0;
try {
  count = await p.$queryRaw`SELECT COUNT(*)::int AS c FROM "ProjectTask"`.then((r) => r[0].c);
} catch (e) {
  console.log("count err", e.message);
}
console.log({ cols, count });
await p.$disconnect();
