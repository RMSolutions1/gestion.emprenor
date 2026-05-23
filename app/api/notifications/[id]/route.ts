export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const existing = await prisma.notification.findFirst({
      where: { id: params.id, userId: user!.id },
    });
    if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { read: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Notification PATCH:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
