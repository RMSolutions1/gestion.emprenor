export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, assertProjectAccess } from "@/lib/api-helpers";
import { isAdmin } from "@/lib/roles";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const projectId = new URL(req.url).searchParams.get("projectId");
    const since = new URL(req.url).searchParams.get("since");
    const limit = Math.min(50, parseInt(new URL(req.url).searchParams.get("limit") || "25"));

    let projectFilter: { projectId?: string | { in: string[] } } = {};

    if (projectId) {
      const ok = await assertProjectAccess(user!.id, user!.role, projectId);
      if (!ok) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
      projectFilter = { projectId };
    } else if (!isAdmin(user!.role)) {
      const assignments = await prisma.projectAssignment.findMany({
        where: { userId: user!.id },
        select: { projectId: true },
      });
      const ids = assignments.map((a) => a.projectId);
      projectFilter = { projectId: { in: ids.length ? ids : ["__none__"] } };
    }

    const events = await prisma.liveFeedEvent.findMany({
      where: {
        ...projectFilter,
        ...(since ? { createdAt: { gt: new Date(since) } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(events);
  } catch (err) {
    console.error("Live feed GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
