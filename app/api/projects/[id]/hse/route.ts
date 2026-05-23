export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireProjectAccess, requireStaff } from "@/lib/api-helpers";
import { getProjectOrgId } from "@/lib/tenant-scope";
import { publishOperationalEvent } from "@/lib/operational-events";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireProjectAccess(params.id);
    if (error) return error;

    const type = new URL(req.url).searchParams.get("type") ?? "all";

    const [incidents, permits, inspections] = await Promise.all([
      type === "all" || type === "incidents"
        ? prisma.hseIncident.findMany({
            where: { projectId: params.id },
            orderBy: { reportedAt: "desc" },
            include: { reporter: { select: { id: true, name: true } } },
          })
        : [],
      type === "all" || type === "permits"
        ? prisma.permitToWork.findMany({
            where: { projectId: params.id },
            orderBy: { createdAt: "desc" },
          })
        : [],
      type === "all" || type === "inspections"
        ? prisma.safetyInspection.findMany({
            where: { projectId: params.id },
            orderBy: { inspectedAt: "desc" },
          })
        : [],
    ]);

    return NextResponse.json({ incidents, permits, inspections });
  } catch (err) {
    console.error("HSE GET:", err);
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
    const kind = body.kind as string;

    if (kind === "incident") {
      const incident = await prisma.hseIncident.create({
        data: {
          organizationId: orgId,
          projectId: params.id,
          title: body.title,
          description: body.description,
          severity: body.severity ?? "LEVE",
          injuredCount: body.injuredCount ?? 0,
          workStoppage: body.workStoppage ?? false,
          investigation: body.investigation,
          reporterId: user!.id,
        },
      });
      await publishOperationalEvent({
        projectId: params.id,
        type: "HSE_INCIDENT",
        title: `Incidente HSE: ${incident.title}`,
        body: incident.severity,
        actorId: user!.id,
        notifyRoles: ["ADMIN"],
      });
      return NextResponse.json(incident);
    }

    if (kind === "permit") {
      const count = await prisma.permitToWork.count({ where: { projectId: params.id } });
      const permit = await prisma.permitToWork.create({
        data: {
          organizationId: orgId,
          projectId: params.id,
          permitNumber: `PTW-${String(count + 1).padStart(4, "0")}`,
          workType: body.workType,
          location: body.location,
          description: body.description,
          status: body.status ?? "BORRADOR",
          validFrom: body.validFrom ? new Date(body.validFrom) : null,
          validUntil: body.validUntil ? new Date(body.validUntil) : null,
        },
      });
      return NextResponse.json(permit);
    }

    if (kind === "inspection") {
      const inspection = await prisma.safetyInspection.create({
        data: {
          organizationId: orgId,
          projectId: params.id,
          title: body.title,
          checklist: body.checklist,
          result: body.result ?? "CONFORME",
          observations: body.observations,
          inspectedAt: body.inspectedAt ? new Date(body.inspectedAt) : new Date(),
        },
      });
      return NextResponse.json(inspection);
    }

    return NextResponse.json({ error: "Tipo HSE invalido" }, { status: 400 });
  } catch (err) {
    console.error("HSE POST:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
