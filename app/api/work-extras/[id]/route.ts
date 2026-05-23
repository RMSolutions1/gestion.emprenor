export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { updateWorkExtraSchema } from "@/lib/schemas";
import { notifyAdmins, publishOperationalEvent, recordAudit } from "@/lib/operational-events";
import { generateApprovalReference } from "@/lib/work-extra-constancia";

function clientIp(req: NextRequest): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const data = updateWorkExtraSchema.parse(body);

    const existing = await prisma.workExtra.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            assignments: true,
            organization: { select: { name: true } },
          },
        },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const isAdmin = user!.role === "ADMIN";
    const isAssignedClient = existing.project.assignments.some(
      (a) => a.userId === user!.id
    );

    if (!isAdmin && !isAssignedClient) {
      return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    if (!isAdmin && data.status && !["APROBADO", "RECHAZADO"].includes(data.status)) {
      return NextResponse.json({ error: "El cliente solo puede aprobar o rechazar" }, { status: 403 });
    }

    if (!isAdmin && (data.title || data.amount !== undefined || data.description !== undefined)) {
      return NextResponse.json({ error: "Sin permisos para editar montos" }, { status: 403 });
    }

    if (data.status === "APROBADO" && !isAdmin && !data.acceptanceConfirmed) {
      return NextResponse.json(
        { error: "Debe confirmar que acepta el presupuesto del adicional" },
        { status: 400 }
      );
    }

    if (isAdmin && data.status === "EN_EJECUCION" && existing.status !== "APROBADO") {
      return NextResponse.json(
        {
          error:
            "No se puede ejecutar un adicional sin aprobacion previa del cliente",
        },
        { status: 409 }
      );
    }

    if (isAdmin && data.status === "COMPLETADO" && !["APROBADO", "EN_EJECUCION"].includes(existing.status)) {
      return NextResponse.json(
        { error: "El adicional debe estar aprobado o en ejecucion para completar" },
        { status: 409 }
      );
    }

    if (
      isAdmin &&
      data.status &&
      ["APROBADO", "EN_EJECUCION", "COMPLETADO"].includes(data.status) &&
      existing.status === "PENDIENTE_CLIENTE"
    ) {
      return NextResponse.json(
        { error: "El cliente debe aprobar el adicional antes de continuar" },
        { status: 409 }
      );
    }

    const now = new Date();
    const updateData: Record<string, unknown> = {};

    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.amount !== undefined) updateData.amount = data.amount;

    if (data.status) {
      updateData.status = data.status;
      if (data.status === "APROBADO") {
        const approvedAt = now;
        updateData.approvedAt = approvedAt;
        updateData.approvedById = user!.id;
        updateData.approvalReference =
          existing.approvalReference ?? generateApprovalReference(existing.id, approvedAt);
        updateData.clientApprovalIp = clientIp(req);
        updateData.rejectedAt = null;
        updateData.rejectedById = null;
      }
      if (data.status === "RECHAZADO") {
        updateData.rejectedAt = now;
        updateData.rejectedById = user!.id;
        updateData.approvedAt = null;
        updateData.approvedById = null;
        updateData.approvalReference = null;
      }
      if (data.status === "EN_EJECUCION") {
        updateData.executedAt = now;
      }
      if (data.status === "COMPLETADO") {
        updateData.completedAt = now;
      }
    }

    const item = await prisma.workExtra.update({
      where: { id: params.id },
      data: updateData,
      include: {
        approvedBy: { select: { id: true, name: true, email: true } },
      },
    });

    await recordAudit({
      actorId: user!.id,
      action: `WORK_EXTRA_${data.status ?? "UPDATE"}`,
      resource: "work_extra",
      resourceId: item.id,
      metadata: {
        status: item.status,
        approvalReference: item.approvalReference,
        amount: String(item.amount),
      },
    });

    if (data.status === "APROBADO") {
      await publishOperationalEvent({
        projectId: item.projectId,
        type: "EXTRA_APPROVED",
        title: `Adicional aprobado: ${item.title}`,
        body: item.approvalReference ?? undefined,
        actorId: user!.id,
        notifyRoles: ["ADMIN"],
        link: `/dashboard/projects/${item.projectId}?tab=extras`,
      });
      await notifyAdmins({
        title: `Cliente aprobo adicional: ${item.title}`,
        projectId: item.projectId,
      });
    }

    if (data.status === "RECHAZADO") {
      await publishOperationalEvent({
        projectId: item.projectId,
        type: "EXTRA_PENDING",
        title: `Adicional rechazado: ${item.title}`,
        actorId: user!.id,
        notifyRoles: ["ADMIN"],
      });
    }

    return NextResponse.json(item);
  } catch (err) {
    console.error("WorkExtra PUT error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;
    if (user!.role !== "ADMIN") {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }
    const extra = await prisma.workExtra.findUnique({ where: { id: params.id } });
    if (extra?.status === "EN_EJECUCION") {
      return NextResponse.json(
        { error: "No se puede eliminar un adicional en ejecucion" },
        { status: 409 }
      );
    }
    await prisma.workExtra.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("WorkExtra DELETE error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
