export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { updateTechnicalReportSchema } from "@/lib/schemas";
import { isAdmin, isCliente } from "@/lib/roles";
import { notifyAdmins, publishOperationalEvent, recordAudit } from "@/lib/operational-events";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const data = updateTechnicalReportSchema.parse(await req.json());
    const existing = await prisma.technicalReport.findUnique({
      where: { id: params.id },
      include: { project: { include: { assignments: true } } },
    });
    if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const isAssignedClient = existing.project.assignments.some((a) => a.userId === user!.id);

    if (isCliente(user!.role)) {
      if (!isAssignedClient) {
        return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
      }
      if (data.status && !["APROBADO", "RECHAZADO", "EN_CORRECCION"].includes(data.status)) {
        return NextResponse.json({ error: "Accion no permitida" }, { status: 403 });
      }
      if (data.title || data.description || data.reportType) {
        return NextResponse.json({ error: "Solo puede aprobar o rechazar" }, { status: 403 });
      }
    } else if (!isAdmin(user!.role) && existing.authorId !== user!.id) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const report = await prisma.technicalReport.update({
      where: { id: params.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.reportType && { reportType: data.reportType }),
        ...(data.status && {
          status: data.status,
          ...(data.status === "PENDIENTE_CLIENTE" && { requiresClientApproval: true }),
        }),
        ...(data.requiresClientApproval !== undefined && {
          requiresClientApproval: data.requiresClientApproval,
        }),
      },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    await recordAudit({
      actorId: user!.id,
      action: `REPORT_${data.status ?? "UPDATE"}`,
      resource: "technical_report",
      resourceId: report.id,
      metadata: { projectId: report.projectId, status: report.status },
    });

    if (data.status === "PENDIENTE_CLIENTE") {
      await publishOperationalEvent({
        projectId: report.projectId,
        type: "REPORT_SUBMITTED",
        title: `Informe pendiente de aprobacion: ${report.title}`,
        actorId: user!.id,
        notifyRoles: ["CLIENTE"],
        notificationType: "APPROVAL_REQUIRED",
        link: `/dashboard/projects/${report.projectId}?tab=reports`,
      });
    } else if (data.status === "APROBADO") {
      await publishOperationalEvent({
        projectId: report.projectId,
        type: "REPORT_APPROVED",
        title: `Informe aprobado: ${report.title}`,
        actorId: user!.id,
        notifyRoles: ["ADMIN"],
        notificationType: "REPORT",
      });
      await notifyAdmins({
        title: `Cliente aprobo informe: ${report.title}`,
        projectId: report.projectId,
        link: `/dashboard/projects/${report.projectId}?tab=reports`,
      });
    } else if (data.status === "RECHAZADO") {
      await publishOperationalEvent({
        projectId: report.projectId,
        type: "REPORT_REJECTED",
        title: `Informe rechazado: ${report.title}`,
        actorId: user!.id,
        notifyRoles: ["ADMIN"],
        notificationType: "REPORT",
      });
    }

    return NextResponse.json(report);
  } catch (err) {
    console.error("Report PUT:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;
    if (!isAdmin(user!.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }
    await prisma.technicalReport.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Report DELETE:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
