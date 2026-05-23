export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { ensureDirectChannel } from "@/lib/chat-service";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const orgId = user!.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Usuario sin organizacion" }, { status: 400 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId || targetUserId === user!.id) {
      return NextResponse.json({ error: "Usuario destino invalido" }, { status: 400 });
    }

    const target = await prisma.user.findFirst({
      where: { id: targetUserId, organizationId: orgId },
    });
    if (!target) {
      return NextResponse.json({ error: "Usuario no encontrado en tu organizacion" }, { status: 404 });
    }

    const channel = await ensureDirectChannel(orgId, user!.id, targetUserId);
    return NextResponse.json(channel);
  } catch (err) {
    console.error("Chat direct POST:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
