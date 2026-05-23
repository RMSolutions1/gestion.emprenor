export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { ensureOrganizationChannel } from "@/lib/chat-service";
import { isPlatformOwner } from "@/lib/roles";

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    if (isPlatformOwner(user!.role)) {
      const channels = await prisma.chatChannel.findMany({
        orderBy: { updatedAt: "desc" },
        take: 50,
        include: {
          project: { select: { id: true, name: true } },
          _count: { select: { messages: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { body: true, createdAt: true, author: { select: { name: true } } },
          },
        },
      });
      return NextResponse.json(channels);
    }

    const orgId = user!.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Usuario sin organizacion" }, { status: 400 });
    }

    await ensureOrganizationChannel(orgId);

    const where =
      user!.role === "ADMIN"
        ? { organizationId: orgId }
        : {
            organizationId: orgId,
            OR: [
              { type: "ORGANIZATION" as const },
              {
                type: "DIRECT" as const,
                members: { some: { userId: user!.id } },
              },
              {
                type: "PROJECT" as const,
                project: { assignments: { some: { userId: user!.id } } },
              },
            ],
          };

    const channels = await prisma.chatChannel.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        project: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { body: true, createdAt: true, author: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json(channels);
  } catch (err) {
    console.error("Chat channels GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
