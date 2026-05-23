export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createUserSchema } from "@/lib/schemas";
import { SPECIALIST_ROLES, isPlatformOwner } from "@/lib/roles";
import { enrichUserWithOrg, orgFilter } from "@/lib/tenant-scope";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const raw = session.user as { id: string; role: string; organizationId?: string | null };
    const user = await enrichUserWithOrg(raw);
    const tenant = orgFilter(user);

    const type = new URL(req.url).searchParams.get("type") ?? "clients";

    const where: Prisma.UserWhereInput = {
      ...tenant,
      ...(type === "team"
        ? { role: { in: [...SPECIALIST_ROLES, "ADMIN"] as Role[] } }
        : type === "all"
          ? { role: { not: "PLATFORM_OWNER" } }
          : { role: Role.CLIENTE }),
    };

    const users = await prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await req.json();
    const validated = createUserSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: validated.email } });
    if (existing) return NextResponse.json({ error: "Email ya registrado" }, { status: 400 });

    const raw = session.user as { id: string; role: string; organizationId?: string | null };
    const actor = await enrichUserWithOrg(raw);
    const orgId = isPlatformOwner(actor.role) ? null : actor.organizationId;

    const hashed = await bcrypt.hash(validated.password, 10);
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashed,
        name: validated.name,
        role: validated.role,
        organizationId: validated.role === "PLATFORM_OWNER" ? null : orgId,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Users POST error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
