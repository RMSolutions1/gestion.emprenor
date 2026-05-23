export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireProjectAccess, requireStaff } from "@/lib/api-helpers";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; orderId: string } }
) {
  try {
    const { user, error } = await requireStaff();
    if (error) return error;
    const access = await requireProjectAccess(params.id);
    if (access.error) return access.error;

    const body = await req.json();
    const existing = await prisma.workOrder.findUnique({
      where: { id: params.orderId, projectId: params.id },
      include: { workExtra: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const execStatuses = ["EN_EJECUCION", "COMPLETADA"];
    if (body.status && execStatuses.includes(body.status)) {
      if (existing.workExtraId && existing.workExtra) {
        if (existing.workExtra.status === "PENDIENTE_CLIENTE") {
          return NextResponse.json(
            {
              error:
                "La orden esta vinculada a un adicional pendiente de aprobacion del cliente",
            },
            { status: 409 }
          );
        }
        if (existing.workExtra.status === "RECHAZADO") {
          return NextResponse.json(
            { error: "El adicional vinculado fue rechazado por el cliente" },
            { status: 409 }
          );
        }
      }
    }

    const order = await prisma.workOrder.update({
      where: { id: params.orderId, projectId: params.id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        assigneeId: body.assigneeId,
        slaDueAt: body.slaDueAt ? new Date(body.slaDueAt) : undefined,
        estimatedCost: body.estimatedCost,
        actualCost: body.actualCost,
        checklist: body.checklist,
        clientApproved: body.clientApproved,
        completedAt: body.status === "COMPLETADA" ? new Date() : body.completedAt,
      },
    });
    return NextResponse.json(order);
  } catch (err) {
    console.error("Work order PUT:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
