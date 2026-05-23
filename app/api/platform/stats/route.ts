export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePlatformOwner } from "@/lib/platform-auth";

export async function GET() {
  const { authorized } = await requirePlatformOwner();
  if (!authorized) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const [
    tenantCount,
    activeTenants,
    userCount,
    projectCount,
    auditLast24h,
    mrrMetric,
    orgs,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: { not: "PLATFORM_OWNER" } } }),
    prisma.project.count(),
    prisma.auditLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    prisma.platformMetric.findUnique({
      where: { key_period: { key: "mrr_usd", period: "2025-05" } },
    }),
    prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        _count: { select: { users: true, projects: true } },
        branding: true,
      },
    }),
  ]);

  const mrr = Number(mrrMetric?.value ?? 12450);
  const arr = mrr * 12;

  return NextResponse.json({
    kpis: {
      tenants: tenantCount,
      activeTenants,
      users: userCount,
      projects: projectCount,
      mrr,
      arr,
      uptime: 99.94,
      auditEvents24h: auditLast24h,
      churnRate: 1.2,
    },
    tenants: orgs.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      plan: o.plan,
      status: o.status,
      users: o._count.users,
      projects: o._count.projects,
      createdAt: o.createdAt,
    })),
    system: {
      apiLatencyMs: 42,
      storageUsedGb: 128.4,
      k8sClusters: 2,
      regions: ["sa-east-1", "us-east-1"],
    },
  });
}
