export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  assertProjectAccess,
  requireAuth,
  requireStaff,
} from "@/lib/api-helpers";
import { createTechnicalReportSchema } from "@/lib/schemas";
import { isAdmin } from "@/lib/roles";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const projectId = new URL(req.url).searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
    }

    const allowed = await assertProjectAccess(user!.id, user!.role, projectId);
    if (!allowed) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const reports = await prisma.technicalReport.findMany({
      where: { projectId },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (err) {
    console.error("Reports GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireStaff();
    if (error) return error;

    const data = createTechnicalReportSchema.parse(await req.json());

    if (!isAdmin(user!.role)) {
      const allowed = await assertProjectAccess(user!.id, user!.role, data.projectId);
      if (!allowed) return NextResponse.json({ error: "Sin acceso al proyecto" }, { status: 403 });
    }

    const needsApproval =
      data.requiresClientApproval ??
      ["NO_CONFORMIDAD", "SOLICITUD_CORRECCION"].includes(data.reportType);

    const status =
      data.status ??
      (needsApproval ? "PENDIENTE_CLIENTE" : "BORRADOR");

    const report = await prisma.technicalReport.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        reportType: data.reportType,
        status,
        requiresClientApproval: needsApproval,
        projectId: data.projectId,
        authorId: user!.id,
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    });

    return NextResponse.json(report);
  } catch (err) {
    console.error("Reports POST:", err);
    return NextResponse.json({ error: "Error al crear informe" }, { status: 500 });
  }
}
