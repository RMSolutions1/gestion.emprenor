export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireProjectAccess, requireStaff } from "@/lib/api-helpers";
import { getProjectOrgId } from "@/lib/tenant-scope";
import { publishOperationalEvent, recordAudit } from "@/lib/operational-events";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireProjectAccess(params.id);
    if (error) return error;

    const orders = await prisma.workOrder.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: "desc" },
      include: {
        assignee: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(orders);
  } catch (err) {
    console.error("Work orders GET:", err);
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
    const count = await prisma.workOrder.count({ where: { organizationId: orgId } });
    const number = `OT-${String(count + 1).padStart(5, "0")}`;

    const order = await prisma.workOrder.create({
      data: {
        organizationId: orgId,
        projectId: params.id,
        number,
        title: body.title,
        description: body.description ?? null,
        status: body.status ?? "BORRADOR",
        assigneeId: body.assigneeId ?? null,
        createdById: user!.id,
        slaDueAt: body.slaDueAt ? new Date(body.slaDueAt) : null,
        estimatedCost: body.estimatedCost ?? null,
        checklist: body.checklist ?? undefined,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    await publishOperationalEvent({
      projectId: params.id,
      type: "WORK_ORDER_CREATED",
      title: `Nueva OT: ${order.title}`,
      body: number,
      actorId: user!.id,
      notifyRoles: ["ADMIN", "CLIENTE"],
    });
    await recordAudit({
      actorId: user!.id,
      action: "CREATE",
      resource: "work_order",
      resourceId: order.id,
      metadata: { projectId: params.id, number },
    });

    return NextResponse.json(order);
  } catch (err) {
    console.error("Work orders POST:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
