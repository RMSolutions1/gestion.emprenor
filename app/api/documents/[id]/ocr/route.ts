export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, assertProjectAccess } from "@/lib/api-helpers";
import { isAdmin } from "@/lib/roles";
import { extractDocumentMetadata } from "@/lib/document-ocr";
import { recordAudit } from "@/lib/operational-events";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;
    if (!isAdmin(user!.role)) {
      return NextResponse.json({ error: "Solo administradores pueden ejecutar OCR" }, { status: 403 });
    }

    const doc = await prisma.document.findUnique({ where: { id: params.id } });
    if (!doc) return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });

    const ok = await assertProjectAccess(user!.id, user!.role, doc.projectId);
    if (!ok) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    await prisma.document.update({
      where: { id: doc.id },
      data: { ocrStatus: "PROCESSING" },
    });

    const ocrText = extractDocumentMetadata(doc);

    const updated = await prisma.document.update({
      where: { id: doc.id },
      data: {
        ocrStatus: "COMPLETED",
        ocrText,
        ocrProcessedAt: new Date(),
      },
    });

    await recordAudit({
      actorId: user!.id,
      action: "DOCUMENT_OCR",
      resource: "Document",
      resourceId: doc.id,
      metadata: { projectId: doc.projectId },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Document OCR:", err);
    await prisma.document
      .update({
        where: { id: params.id },
        data: { ocrStatus: "FAILED" },
      })
      .catch(() => {});
    return NextResponse.json({ error: "Error en OCR" }, { status: 500 });
  }
}
