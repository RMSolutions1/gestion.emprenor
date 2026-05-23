export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireProjectAccess, requireStaff } from "@/lib/api-helpers";
import { getProjectOrgId } from "@/lib/tenant-scope";
import { publishOperationalEvent } from "@/lib/operational-events";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireProjectAccess(params.id);
    if (error) return error;

    const items = await prisma.qualityNonConformance.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
        correctiveActions: true,
      },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("Quality NC GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireStaff();
    if (error) return error;
    const access = await requireProjectAccess(params.id);
    if (access.error) return access.error;

    const orgId = await getProjectOrgId(params.id);
    if (!orgId) return NextResponse.json({ error: "Proyecto sin organizacion" }, { status: 400 });

    const body = await req.json();
    const count = await prisma.qualityNonConformance.count({ where: { projectId: params.id } });
    const code = `NC-${String(count + 1).padStart(4, "0")}`;

    const nc = await prisma.qualityNonConformance.create({
      data: {
        organizationId: orgId,
        projectId: params.id,
        code,
        title: body.title,
        description: body.description ?? null,
        isoClause: body.isoClause ?? null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        authorId: user!.id,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    if (body.correctiveTitle) {
      await prisma.correctiveAction.create({
        data: {
          ncId: nc.id,
          type: "CORRECTIVA",
          title: body.correctiveTitle,
          description: body.correctiveDescription,
          ownerId: user!.id,
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
        },
      });
    }

    await publishOperationalEvent({
      projectId: params.id,
      type: "NC_CREATED",
      title: `No conformidad: ${nc.title}`,
      body: code,
      actorId: user!.id,
      notifyRoles: ["ADMIN", "CLIENTE"],
    });

    return NextResponse.json(nc);
  } catch (err) {
    console.error("Quality NC POST:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
