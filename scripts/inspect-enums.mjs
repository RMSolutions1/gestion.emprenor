import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const enums = await p.$queryRaw`
  SELECT t.typname, e.enumlabel
  FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  WHERE t.typname ILIKE '%task%' OR t.typname ILIKE '%milestone%' OR t.typname ILIKE '%daily%' OR t.typname ILIKE '%report%'
  ORDER BY t.typname, e.enumsortorder
`;
console.log(JSON.stringify(enums, null, 2));
await p.$disconnect();
