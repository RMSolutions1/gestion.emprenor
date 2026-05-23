export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, assertProjectAccess } from "@/lib/api-helpers";
import { sendChatMessage } from "@/lib/chat-service";
import { isPlatformOwner } from "@/lib/roles";
import type { MessagePriority } from "@prisma/client";

async function canAccessChannel(
  userId: string,
  role: string,
  channel: { id: string; organizationId: string; type: string; projectId: string | null }
) {
  if (isPlatformOwner(role)) return true;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });
  if (user?.organizationId !== channel.organizationId) return false;
  if (channel.type === "ORGANIZATION") return true;
  if (channel.type === "DIRECT") {
    const member = await prisma.chatChannelMember.findFirst({
      where: { channelId: channel.id, userId },
    });
    return !!member;
  }
  if (role === "ADMIN") return true;
  if (channel.projectId) {
    return assertProjectAccess(userId, role, channel.projectId);
  }
  return false;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const channel = await prisma.chatChannel.findUnique({
      where: { id: params.channelId },
      include: { project: { select: { id: true, name: true } } },
    });
    if (!channel) return NextResponse.json({ error: "Canal no encontrado" }, { status: 404 });

    const ok = await canAccessChannel(user!.id, user!.role, channel);
    if (!ok) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const messages = await prisma.chatMessage.findMany({
      where: { channelId: channel.id, parentId: null },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: {
        author: { select: { id: true, name: true, role: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    return NextResponse.json({ channel, messages });
  } catch (err) {
    console.error("Channel GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const channel = await prisma.chatChannel.findUnique({
      where: { id: params.channelId },
    });
    if (!channel) return NextResponse.json({ error: "Canal no encontrado" }, { status: 404 });

    const ok = await canAccessChannel(user!.id, user!.role, channel);
    if (!ok) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const body = await req.json();
    const text = String(body.body ?? "").trim();
    if (!text) return NextResponse.json({ error: "Mensaje vacio" }, { status: 400 });

    await prisma.chatChannelMember.upsert({
      where: { channelId_userId: { channelId: channel.id, userId: user!.id } },
      update: {},
      create: { channelId: channel.id, userId: user!.id },
    });

    const message = await sendChatMessage({
      channelId: channel.id,
      authorId: user!.id,
      body: text,
      parentId: body.parentId,
      priority: (body.priority as MessagePriority) ?? "NORMAL",
      projectId: channel.projectId,
      organizationId: channel.organizationId,
      channelLink: channel.projectId
        ? `/dashboard/projects/${channel.projectId}?tab=chat`
        : `/dashboard/comunicaciones`,
    });

    await prisma.chatChannel.update({
      where: { id: channel.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (err) {
    console.error("Channel POST:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
