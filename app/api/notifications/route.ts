export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const unreadOnly = new URL(req.url).searchParams.get("unread") === "1";

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user!.id,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user!.id, read: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error("Notifications GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    if (body.markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: user!.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Accion no valida" }, { status: 400 });
  } catch (err) {
    console.error("Notifications PATCH:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
