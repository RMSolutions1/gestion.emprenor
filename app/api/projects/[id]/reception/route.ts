export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { z } from "zod";
import {
  computeWarrantyEnd,
  getWarrantyStatus,
  MIN_WARRANTY_DAYS,
  warrantyDaysRemaining,
} from "@/lib/warranty";
import { generateReceptionReference } from "@/lib/project-reception-cert";
import { publishOperationalEvent, recordAudit } from "@/lib/operational-events";

const bodySchema = z.object({
  receptionReady: z.boolean().optional(),
  confirmReception: z.boolean().optional(),
  acceptanceConfirmed: z.boolean().optional(),
  receptionNotes: z.string().optional(),
  warrantyDays: z.number().int().min(120).max(365).optional(),
});

function clientIp(req: NextRequest): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

async function loadProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      assignments: true,
      receptionBy: { select: { id: true, name: true, email: true } },
      organization: { select: { name: true } },
      workExtras: { where: { status: "PENDIENTE_CLIENTE" }, select: { id: true, title: true } },
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const project = await loadProject(params.id);
    if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const isAdmin = user!.role === "ADMIN";
    const isAssigned = project.assignments.some((a) => a.userId === user!.id);
    if (!isAdmin && !isAssigned) {
      return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    const status = getWarrantyStatus(project);
    return NextResponse.json({
      status,
      receptionReadyAt: project.receptionReadyAt,
      receptionAt: project.receptionAt,
      receptionReference: project.receptionReference,
      warrantyDays: project.warrantyDays,
      warrantyStartAt: project.warrantyStartAt,
      warrantyEndAt: project.warrantyEndAt,
      daysRemaining: warrantyDaysRemaining(project.warrantyEndAt),
      receptionBy: project.receptionBy,
      pendingExtras: project.workExtras,
      policyCode: "POL-GAR-001",
      minWarrantyDays: MIN_WARRANTY_DAYS,
    });
  } catch (err) {
    console.error("Reception GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = bodySchema.parse(await req.json());
    const project = await loadProject(params.id);
    if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const isAdmin = user!.role === "ADMIN";
    const isAssignedClient = project.assignments.some((a) => a.userId === user!.id);

    if (body.receptionReady !== undefined) {
      if (!isAdmin) {
        return NextResponse.json({ error: "Solo administración puede marcar lista para recepción" }, { status: 403 });
      }
      if (project.receptionAt) {
        return NextResponse.json({ error: "La obra ya fue recibida" }, { status: 409 });
      }
      const updated = await prisma.project.update({
        where: { id: params.id },
        data: {
          receptionReadyAt: body.receptionReady ? new Date() : null,
        },
      });
      if (body.receptionReady) {
        await publishOperationalEvent({
          projectId: params.id,
          type: "PROJECT_UPDATED",
          title: "Obra lista para recepción final del cliente",
          body: "CONF-EL-001 pendiente de conformidad",
          actorId: user!.id,
          notifyRoles: ["CLIENTE"],
          link: `/dashboard/projects/${params.id}?tab=reception`,
        });
      }
      return NextResponse.json({ ...updated, status: getWarrantyStatus(updated) });
    }

    if (body.confirmReception) {
      if (user!.role !== "CLIENTE") {
        return NextResponse.json(
          { error: "Solo el cliente puede confirmar la recepción final" },
          { status: 403 }
        );
      }
      if (!isAssignedClient) {
        return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
      }
      if (!body.acceptanceConfirmed) {
        return NextResponse.json(
          { error: "Debe confirmar la recepción conforme de la obra" },
          { status: 400 }
        );
      }
      if (project.receptionAt) {
        return NextResponse.json({ error: "La recepción ya fue registrada" }, { status: 409 });
      }
      if (!project.receptionReadyAt) {
        return NextResponse.json(
          { error: "El proveedor aún no habilitó la recepción final" },
          { status: 409 }
        );
      }
      if (project.workExtras.length > 0) {
        return NextResponse.json(
          {
            error: "Existen adicionales pendientes de su aprobación. Resuélvalos antes de la recepción final.",
            pendingExtras: project.workExtras,
          },
          { status: 409 }
        );
      }

      const now = new Date();
      const days = Math.max(MIN_WARRANTY_DAYS, body.warrantyDays ?? project.warrantyDays ?? MIN_WARRANTY_DAYS);
      const warrantyEndAt = computeWarrantyEnd(now, days);
      const reference = generateReceptionReference(project.id, now);

      const updated = await prisma.project.update({
        where: { id: params.id },
        data: {
          receptionAt: now,
          receptionById: user!.id,
          receptionClientIp: clientIp(req),
          receptionReference: reference,
          receptionNotes: body.receptionNotes ?? null,
          warrantyDays: days,
          warrantyStartAt: now,
          warrantyEndAt,
          status: "FINALIZADO",
        },
        include: {
          receptionBy: { select: { id: true, name: true, email: true } },
        },
      });

      await recordAudit({
        actorId: user!.id,
        action: "PROJECT_RECEPTION_CONFIRMED",
        resource: "project",
        resourceId: project.id,
        metadata: { reference, warrantyDays: days, warrantyEndAt: warrantyEndAt.toISOString() },
      });

      await publishOperationalEvent({
        projectId: params.id,
        type: "PROJECT_UPDATED",
        title: `Recepción final — garantía ${days} días`,
        body: reference,
        actorId: user!.id,
        notifyRoles: ["ADMIN"],
        link: `/dashboard/projects/${params.id}?tab=reception`,
      });

      return NextResponse.json({
        ...updated,
        status: getWarrantyStatus(updated),
        daysRemaining: warrantyDaysRemaining(updated.warrantyEndAt),
        certificadoUrl: `/api/projects/${params.id}/reception/certificado`,
      });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (err) {
    console.error("Reception PUT:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
