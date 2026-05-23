export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/api-helpers";
import { createPacDocumentSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const orgId = user!.organizationId;
    if (!orgId) return NextResponse.json([]);

    const docs = await prisma.tenantPacDocument.findMany({
      where: { organizationId: orgId },
      orderBy: { code: "asc" },
    });

    return NextResponse.json(docs);
  } catch (err) {
    console.error("PAC GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const orgId = user!.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Sin organizacion" }, { status: 400 });
    }

    const body = createPacDocumentSchema.parse(await req.json());
    const doc = await prisma.tenantPacDocument.create({
      data: {
        organizationId: orgId,
        code: body.code,
        title: body.title,
        revision: body.revision ?? null,
        fileName: body.fileName,
        cloudStoragePath: body.cloudStoragePath,
      },
    });

    return NextResponse.json(doc);
  } catch (err) {
    console.error("PAC POST:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
