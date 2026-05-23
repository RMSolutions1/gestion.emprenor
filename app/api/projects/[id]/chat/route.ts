export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireProjectAccess } from "@/lib/api-helpers";
import { ensureProjectChannel, sendChatMessage } from "@/lib/chat-service";
import { getProjectOrgId } from "@/lib/tenant-scope";
import type { MessagePriority } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireProjectAccess(params.id);
    if (error) return error;

    const orgId = await getProjectOrgId(params.id);
    if (!orgId) return NextResponse.json({ error: "Proyecto sin organizacion" }, { status: 400 });

    const channel = await ensureProjectChannel(params.id, orgId);
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
    console.error("Project chat GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireProjectAccess(params.id);
    if (error) return error;

    const body = await req.json();
    const text = String(body.body ?? "").trim();
    if (!text) return NextResponse.json({ error: "Mensaje vacio" }, { status: 400 });

    const orgId = await getProjectOrgId(params.id);
    if (!orgId) return NextResponse.json({ error: "Proyecto sin organizacion" }, { status: 400 });

    const channel = await ensureProjectChannel(params.id, orgId);
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
      projectId: params.id,
      organizationId: orgId,
      channelLink: `/dashboard/projects/${params.id}?tab=chat`,
    });

    return NextResponse.json(message);
  } catch (err) {
    console.error("Project chat POST:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
