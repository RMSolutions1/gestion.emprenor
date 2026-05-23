export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertProjectAccess, requireAuth } from "@/lib/api-helpers";
import { createSiteLogSchema } from "@/lib/schemas";
import { isAdmin, isSpecialist } from "@/lib/roles";
import { jsonOk, jsonError } from "@/lib/json-response";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const allowed = await assertProjectAccess(user!.id, user!.role, params.id);
    if (!allowed) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const entries = await prisma.siteLogEntry.findMany({
      where: { projectId: params.id },
      include: { uploadedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(entries);
  } catch (err) {
    console.error("SiteLog GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const role = user!.role;
    if (!isAdmin(role) && !isSpecialist(role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const allowed = await assertProjectAccess(user!.id, role, params.id);
    if (!allowed) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const body = createSiteLogSchema.parse(await req.json());
    if (body.projectId !== params.id) {
      return NextResponse.json({ error: "projectId inconsistente" }, { status: 400 });
    }

    const entry = await prisma.siteLogEntry.create({
      data: {
        projectId: params.id,
        phase: body.phase,
        title: body.title,
        notes: body.notes ?? null,
        fileName: body.fileName ?? null,
        cloudStoragePath: body.cloudStoragePath ?? null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        uploadedById: user!.id,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    return jsonOk(entry);
  } catch (err) {
    console.error("SiteLog POST:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
