export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/json-response";
import { assertProjectAccess, requireAuth, requireAdmin } from "@/lib/api-helpers";
import { createWorkExtraSchema } from "@/lib/schemas";
import { publishOperationalEvent, recordAudit } from "@/lib/operational-events";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const projectId = new URL(req.url).searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
    }

    const allowed = await assertProjectAccess(user!.id, user!.role, projectId);
    if (!allowed) {
      return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    const items = await prisma.workExtra.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(items);
  } catch (err) {
    console.error("WorkExtras GET error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const data = createWorkExtraSchema.parse(body);

    const item = await prisma.workExtra.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        amount: data.amount,
        status: data.status,
        projectId: data.projectId,
      },
    });

    await recordAudit({
      actorId: user!.id,
      action: "WORK_EXTRA_CREATE",
      resource: "work_extra",
      resourceId: item.id,
      metadata: { projectId: item.projectId, amount: String(item.amount) },
    });

    if (item.status === "PENDIENTE_CLIENTE") {
      await publishOperationalEvent({
        projectId: item.projectId,
        type: "EXTRA_PENDING",
        title: `Adicional pendiente: ${item.title}`,
        body: `$${item.amount}`,
        actorId: user!.id,
        notifyRoles: ["CLIENTE"],
        notificationType: "APPROVAL_REQUIRED",
        link: `/dashboard/projects/${item.projectId}?tab=extras`,
      });
    }

    return jsonOk(item);
  } catch (err) {
    console.error("WorkExtras POST error:", err);
    return NextResponse.json({ error: "Error al registrar adicional" }, { status: 500 });
  }
}
