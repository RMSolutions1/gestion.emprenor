export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { mentionSlug } from "@/lib/chat-mentions";
import { isPlatformOwner } from "@/lib/roles";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const q = new URL(req.url).searchParams.get("q")?.toLowerCase() ?? "";
    const projectId = new URL(req.url).searchParams.get("projectId");

    if (isPlatformOwner(user!.role)) {
      const users = await prisma.user.findMany({
        where: q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        take: 20,
        select: { id: true, name: true, email: true, role: true },
      });
      return NextResponse.json(
        users.map((u) => ({ ...u, slug: mentionSlug(u) }))
      );
    }

    const orgId = user!.organizationId;
    if (!orgId) return NextResponse.json({ error: "Sin organizacion" }, { status: 400 });

    let userIds: string[] | undefined;
    if (projectId) {
      const assignments = await prisma.projectAssignment.findMany({
        where: { projectId },
        select: { userId: true },
      });
      const admins = await prisma.user.findMany({
        where: { organizationId: orgId, role: "ADMIN" },
        select: { id: true },
      });
      userIds = [...new Set([...assignments.map((a) => a.userId), ...admins.map((a) => a.id)])];
    }

    const users = await prisma.user.findMany({
      where: {
        organizationId: orgId,
        id: userIds ? { in: userIds } : undefined,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      take: 20,
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users.map((u) => ({ ...u, slug: mentionSlug(u) })));
  } catch (err) {
    console.error("Mentionables GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
