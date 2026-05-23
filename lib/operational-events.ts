import { prisma } from "@/lib/db";
import type { LiveFeedEventType, NotificationType, Prisma } from "@prisma/client";

type PublishInput = {
  projectId?: string | null;
  type: LiveFeedEventType;
  title: string;
  body?: string;
  actorId?: string;
  metadata?: Prisma.InputJsonValue;
  notifyRoles?: ("CLIENTE" | "ADMIN")[];
  link?: string;
  notificationType?: NotificationType;
};

export async function recordAudit(params: {
  actorId?: string | null;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId ?? null,
        metadata: params.metadata ?? undefined,
      },
    });
  } catch (e) {
    console.error("AuditLog error:", e);
  }
}

export async function publishOperationalEvent(input: PublishInput) {
  const event = await prisma.liveFeedEvent.create({
    data: {
      projectId: input.projectId ?? null,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      actorId: input.actorId ?? null,
      metadata: input.metadata ?? undefined,
    },
  });

  if (input.projectId && input.notifyRoles?.length) {
    const assignments = await prisma.projectAssignment.findMany({
      where: {
        projectId: input.projectId,
        user: { role: { in: input.notifyRoles } },
      },
      select: { userId: true },
    });

    if (assignments.length > 0) {
      await prisma.notification.createMany({
        data: assignments.map((a) => ({
          userId: a.userId,
          type: input.notificationType ?? "SYSTEM",
          title: input.title,
          body: input.body ?? null,
          link: input.link ?? `/dashboard/projects/${input.projectId}`,
          projectId: input.projectId,
        })),
      });
    }
  }

  return event;
}

export async function notifyAdmins(params: {
  title: string;
  body?: string;
  link?: string;
  type?: NotificationType;
  projectId?: string;
}) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  if (admins.length === 0) return;
  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type: params.type ?? "SYSTEM",
      title: params.title,
      body: params.body ?? null,
      link: params.link ?? null,
      projectId: params.projectId ?? null,
    })),
  });
}
