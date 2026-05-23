import { prisma } from "@/lib/db";
import { emitChannelMessage } from "@/lib/socket-server";
import { publishOperationalEvent } from "@/lib/operational-events";
import { parseMentionIds, type MentionableUser } from "@/lib/chat-mentions";
import type { MessagePriority } from "@prisma/client";

function buildDmKey(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join(":");
}

export async function ensureDirectChannel(
  organizationId: string,
  userIdA: string,
  userIdB: string
) {
  if (userIdA === userIdB) throw new Error("No se puede crear DM consigo mismo");
  const dmKey = buildDmKey(userIdA, userIdB);

  let channel = await prisma.chatChannel.findUnique({ where: { dmKey } });
  if (channel) return channel;

  const users = await prisma.user.findMany({
    where: { id: { in: [userIdA, userIdB] } },
    select: { id: true, name: true },
  });
  const names = users.map((u) => u.name.split(" ")[0]).join(" & ");

  channel = await prisma.chatChannel.create({
    data: {
      organizationId,
      type: "DIRECT",
      name: `DM: ${names}`,
      description: "Mensaje directo",
      dmKey,
    },
  });

  await prisma.chatChannelMember.createMany({
    data: [
      { channelId: channel.id, userId: userIdA },
      { channelId: channel.id, userId: userIdB },
    ],
    skipDuplicates: true,
  });

  return channel;
}

export async function ensureOrganizationChannel(organizationId: string, orgName?: string) {
  let channel = await prisma.chatChannel.findFirst({
    where: { organizationId, type: "ORGANIZATION", projectId: null },
  });
  if (channel) return channel;

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true },
  });

  channel = await prisma.chatChannel.create({
    data: {
      organizationId,
      type: "ORGANIZATION",
      name: `Empresa: ${orgName ?? org?.name ?? "General"}`,
      description: "Canal general de la organizacion",
    },
  });

  const staff = await prisma.user.findMany({
    where: { organizationId },
    select: { id: true },
  });
  if (staff.length > 0) {
    await prisma.chatChannelMember.createMany({
      data: staff.map((u) => ({ channelId: channel!.id, userId: u.id })),
      skipDuplicates: true,
    });
  }
  return channel;
}

export async function ensureProjectChannel(projectId: string, organizationId: string) {
  let channel = await prisma.chatChannel.findFirst({
    where: { projectId, type: "PROJECT" },
  });
  if (channel) return channel;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });

  channel = await prisma.chatChannel.create({
    data: {
      organizationId,
      projectId,
      type: "PROJECT",
      name: `Obra: ${project?.name ?? projectId}`,
      description: "Canal operativo del proyecto",
    },
  });

  const members = await prisma.projectAssignment.findMany({
    where: { projectId },
    select: { userId: true },
  });
  const admins = await prisma.user.findMany({
    where: { organizationId, role: "ADMIN" },
    select: { id: true },
  });
  const userIds = new Set([
    ...members.map((m) => m.userId),
    ...admins.map((a) => a.id),
  ]);
  if (userIds.size > 0) {
    await prisma.chatChannelMember.createMany({
      data: [...userIds].map((userId) => ({ channelId: channel!.id, userId })),
      skipDuplicates: true,
    });
  }
  return channel;
}

async function notifyMentions(params: {
  mentionIds: string[];
  authorId: string;
  authorName: string;
  body: string;
  link: string;
  projectId?: string | null;
}) {
  const targets = params.mentionIds.filter((id) => id !== params.authorId);
  if (targets.length === 0) return;
  await prisma.notification.createMany({
    data: targets.map((userId) => ({
      userId,
      type: "CHAT" as const,
      title: `${params.authorName} te menciono`,
      body: params.body.slice(0, 120),
      link: params.link,
      projectId: params.projectId ?? null,
    })),
  });
}

export async function sendChatMessage(params: {
  channelId: string;
  authorId: string;
  body: string;
  parentId?: string;
  priority?: MessagePriority;
  projectId?: string | null;
  organizationId?: string;
  channelLink?: string;
}) {
  const trimmed = params.body.trim();
  let mentionIds: string[] = [];
  if (params.organizationId) {
    const orgUsers = await prisma.user.findMany({
      where: { organizationId: params.organizationId },
      select: { id: true, name: true, email: true },
    });
    mentionIds = parseMentionIds(trimmed, orgUsers as MentionableUser[]);
  }

  const message = await prisma.chatMessage.create({
    data: {
      channelId: params.channelId,
      authorId: params.authorId,
      body: trimmed,
      parentId: params.parentId ?? null,
      priority: params.priority ?? "NORMAL",
      metadata: mentionIds.length > 0 ? { mentionIds } : undefined,
    },
    include: {
      author: { select: { id: true, name: true, role: true } },
      replies: {
        take: 0,
        include: { author: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  const payload = {
    ...message,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };

  emitChannelMessage(params.channelId, payload);

  const link =
    params.channelLink ??
    (params.projectId
      ? `/dashboard/projects/${params.projectId}?tab=chat`
      : "/dashboard/comunicaciones");

  if (mentionIds.length > 0) {
    await notifyMentions({
      mentionIds,
      authorId: params.authorId,
      authorName: message.author.name,
      body: trimmed,
      link,
      projectId: params.projectId,
    });
  }

  if (params.projectId) {
    await publishOperationalEvent({
      projectId: params.projectId,
      type: "CHAT_MESSAGE",
      title: `Mensaje: ${trimmed.slice(0, 80)}`,
      body: message.author.name,
      actorId: params.authorId,
      notifyRoles: ["ADMIN", "CLIENTE"],
      notificationType: "CHAT",
      link,
    });
  }

  return message;
}
