export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, assertProjectAccess } from "@/lib/api-helpers";
import { recordAudit } from "@/lib/operational-events";
import { createHash } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const doc = await prisma.document.findUnique({
      where: { id: params.id },
      include: { project: { select: { organizationId: true } } },
    });
    if (!doc) return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });

    const ok = await assertProjectAccess(user!.id, user!.role, doc.projectId);
    if (!ok) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    if (doc.signedAt) {
      return NextResponse.json({ error: "Documento ya firmado" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const signatureNote = String(body.signatureNote ?? "Conformidad registrada en plataforma").trim();

    const payload = `${doc.id}|${doc.fileName}|v${doc.version}|${user!.id}|${Date.now()}`;
    const signatureHash = createHash("sha256").update(payload).digest("hex");

    const updated = await prisma.document.update({
      where: { id: doc.id },
      data: {
        signedAt: new Date(),
        signedById: user!.id,
        signatureNote: `${signatureNote}\nHash: ${signatureHash.slice(0, 16)}…`,
      },
      include: { signedBy: { select: { id: true, name: true, role: true } } },
    });

    await recordAudit({
      actorId: user!.id,
      action: "DOCUMENT_SIGNED",
      resource: "Document",
      resourceId: doc.id,
      metadata: { projectId: doc.projectId, signatureHash: signatureHash.slice(0, 32) },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Document sign:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
