import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "owner@emprenor.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("USER_NOT_FOUND");
    return;
  }
  console.log("role:", user.role);
  console.log("password_match:", await bcrypt.compare("platform2024", user.password));
}

main()
  .finally(() => prisma.$disconnect());
