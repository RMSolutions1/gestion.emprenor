export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-helpers";
import { updateMaterialSchema } from "@/lib/schemas";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const data = updateMaterialSchema.parse(await req.json());
    const item = await prisma.projectMaterial.update({
      where: { id: params.id },
      data: {
        ...(data.itemName && { itemName: data.itemName }),
        ...(data.quantity !== undefined && { quantity: data.quantity ?? null }),
        ...(data.unit !== undefined && { unit: data.unit ?? null }),
        ...(data.category && { category: data.category }),
        ...(data.notes !== undefined && { notes: data.notes ?? null }),
        ...(data.workerId !== undefined && { workerId: data.workerId ?? null }),
        ...(data.supplier !== undefined && { supplier: data.supplier ?? null }),
        ...(data.brand !== undefined && { brand: data.brand ?? null }),
        ...(data.unitPrice !== undefined && { unitPrice: data.unitPrice ?? null }),
        ...(data.deliveryStatus && { deliveryStatus: data.deliveryStatus }),
        ...(data.receivedQuantity !== undefined && {
          receivedQuantity: data.receivedQuantity ?? null,
        }),
      },
      include: {
        documents: {
          select: { id: true, fileName: true, category: true, uploadedAt: true },
        },
      },
    });
    return NextResponse.json(item);
  } catch (err) {
    console.error("Material PUT:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    await prisma.projectMaterial.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Material DELETE:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
