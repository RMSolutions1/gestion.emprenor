export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/json-response";
import { assertProjectAccess, requireAdmin, requireAuth } from "@/lib/api-helpers";
import { createMaterialSchema } from "@/lib/schemas";

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

    const materials = await prisma.projectMaterial.findMany({
      where: { projectId },
      include: {
        worker: { select: { id: true, name: true } },
        documents: {
          select: {
            id: true,
            fileName: true,
            category: true,
            uploadedAt: true,
          },
          orderBy: { uploadedAt: "desc" },
        },
      },
      orderBy: { category: "asc" },
    });

    return jsonOk(materials);
  } catch (err) {
    console.error("Materials GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const data = createMaterialSchema.parse(await req.json());
    const item = await prisma.projectMaterial.create({
      data: {
        itemName: data.itemName,
        quantity: data.quantity ?? null,
        unit: data.unit ?? null,
        category: data.category,
        notes: data.notes ?? null,
        supplier: data.supplier ?? null,
        brand: data.brand ?? null,
        unitPrice: data.unitPrice ?? null,
        deliveryStatus: data.deliveryStatus ?? "PENDIENTE",
        receivedQuantity: data.receivedQuantity ?? null,
        workerId: data.workerId ?? null,
        projectId: data.projectId,
      },
      include: { worker: { select: { id: true, name: true } } },
    });

    return jsonOk(item);
  } catch (err) {
    console.error("Materials POST:", err);
    return NextResponse.json({ error: "Error al crear item" }, { status: 500 });
  }
}
