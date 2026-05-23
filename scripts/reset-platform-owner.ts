/**
 * Crea o restablece la cuenta Platform Owner (desarrollo local).
 * Uso: npm run reset-owner
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EMAIL = "owner@emprenor.com";
const PASSWORD = "platform2024";

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      password: hash,
      role: "PLATFORM_OWNER",
      organizationId: null,
      name: "Global Platform Owner",
    },
    create: {
      email: EMAIL,
      password: hash,
      role: "PLATFORM_OWNER",
      name: "Global Platform Owner",
    },
  });
  console.log("\nPlatform Owner listo:");
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log(`  Rol:      ${user.role}`);
  console.log(`  URL:      http://localhost:3001/login\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
