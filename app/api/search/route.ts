export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { orgFilter } from "@/lib/tenant-scope";
import { isPlatformOwner } from "@/lib/roles";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) {
      return NextResponse.json({ projects: [], documents: [], workOrders: [] });
    }

    const org = orgFilter(user!);
    const projectWhere = isPlatformOwner(user!.role)
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { address: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {
          ...org,
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { address: { contains: q, mode: "insensitive" as const } },
          ],
        };

    const [projects, documents, workOrders] = await Promise.all([
      prisma.project.findMany({
        where: projectWhere,
        take: 10,
        select: { id: true, name: true, status: true, address: true },
      }),
      prisma.document.findMany({
        where: {
          fileName: { contains: q, mode: "insensitive" },
          ...(isPlatformOwner(user!.role) ? {} : { project: org }),
        },
        take: 10,
        select: { id: true, fileName: true, category: true, projectId: true },
      }),
      prisma.workOrder.findMany({
        where: {
          ...org,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { number: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
        select: { id: true, number: true, title: true, status: true, projectId: true },
      }),
    ]);

    return NextResponse.json({ projects, documents, workOrders, query: q });
  } catch (err) {
    console.error("Search GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
