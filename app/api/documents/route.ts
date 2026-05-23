export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireAdmin, assertProjectAccess } from "@/lib/api-helpers";
import { publishOperationalEvent } from "@/lib/operational-events";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const projectId = new URL(req.url).searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
    }

    const ok = await assertProjectAccess(user!.id, user!.role, projectId);
    if (!ok) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const documents = await prisma.document.findMany({
      where: { projectId },
      orderBy: { uploadedAt: "desc" },
      include: { signedBy: { select: { id: true, name: true } } },
    });
    return NextResponse.json(documents);
  } catch (err) {
    console.error("Documents GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const projectId = body.projectId;
    if (!projectId) {
      return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
    }

    const ok = await assertProjectAccess(user!.id, user!.role, projectId);
    if (!ok) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const doc = await prisma.document.create({
      data: {
        fileName: body.fileName,
        cloudStoragePath: body.cloudStoragePath,
        isPublic: body.isPublic ?? false,
        category: body.category,
        projectId,
        projectMaterialId: body.projectMaterialId ?? null,
        ocrStatus: "PENDING",
      },
    });

    await publishOperationalEvent({
      projectId,
      type: "DOCUMENT_UPLOADED",
      title: `Documento: ${doc.fileName}`,
      actorId: user!.id,
      notifyRoles: ["ADMIN", "CLIENTE"],
      link: `/dashboard/projects/${projectId}?tab=documents`,
    });

    return NextResponse.json(doc);
  } catch (err) {
    console.error("Documents POST:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
