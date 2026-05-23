export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { assertProjectAccess } from "@/lib/api-helpers";
import { isAdmin } from "@/lib/roles";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const doc = await prisma.document.findUnique({ where: { id: params.id } });
    if (!doc) return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });

    const ok = await assertProjectAccess(user!.id, user!.role, doc.projectId);
    if (!ok) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const versions = await prisma.documentVersion.findMany({
      where: { documentId: params.id },
      orderBy: { versionNumber: "desc" },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ document: doc, versions });
  } catch (err) {
    console.error("Document versions GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;
    if (!isAdmin(user!.role)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const doc = await prisma.document.findUnique({ where: { id: params.id } });
    if (!doc) return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });

    const body = await req.json();
    const fileName = String(body.fileName ?? "").trim();
    const cloudStoragePath = String(body.cloudStoragePath ?? "").trim();
    if (!fileName || !cloudStoragePath) {
      return NextResponse.json({ error: "fileName y cloudStoragePath requeridos" }, { status: 400 });
    }

    const nextVersion = doc.version + 1;

    await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        versionNumber: doc.version,
        fileName: doc.fileName,
        cloudStoragePath: doc.cloudStoragePath,
        uploadedById: user!.id,
        changeNote: body.changeNote ?? `Version ${doc.version} archivada`,
      },
    });

    const updated = await prisma.document.update({
      where: { id: doc.id },
      data: {
        version: nextVersion,
        fileName,
        cloudStoragePath,
        uploadedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Document versions POST:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
