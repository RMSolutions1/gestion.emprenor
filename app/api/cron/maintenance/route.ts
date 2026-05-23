export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, trialExpiredEmail } from "@/lib/email";
import { getComplianceExpiryAlerts } from "@/lib/compliance-alerts";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  const expiredTrials = await prisma.organization.findMany({
    where: {
      status: "TRIAL",
      trialEndsAt: { lt: now },
    },
    include: {
      users: { where: { role: "ADMIN" }, select: { id: true, email: true } },
    },
  });

  let suspended = 0;
  for (const org of expiredTrials) {
    await prisma.organization.update({
      where: { id: org.id },
      data: { status: "SUSPENDED" },
    });
    suspended += 1;

    const mail = trialExpiredEmail(org.name);
    for (const admin of org.users) {
      await sendEmail({ to: admin.email, ...mail });
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "SYSTEM",
          title: "Trial finalizado",
          body: "Active un plan en Facturacion para reactivar su cuenta.",
          link: "/dashboard/billing",
        },
      });
    }
  }

  const alerts = await getComplianceExpiryAlerts();
  const critical = alerts.filter((a) => a.level === "VENCIDO");
  const byOrg = new Map<string, typeof critical>();

  for (const alert of critical) {
    const project = await prisma.project.findUnique({
      where: { id: alert.projectId },
      select: { organizationId: true },
    });
    if (!project?.organizationId) continue;
    const list = byOrg.get(project.organizationId) ?? [];
    list.push(alert);
    byOrg.set(project.organizationId, list);
  }

  let complianceNotifications = 0;
  for (const [orgId, orgAlerts] of byOrg) {
    const admins = await prisma.user.findMany({
      where: { organizationId: orgId, role: "ADMIN" },
      select: { id: true },
    });
    const sample = orgAlerts.slice(0, 3).map((a) => `${a.name} (${a.projectName})`).join("; ");
    const body = `${orgAlerts.length} vencimiento(s) critico(s) en obra. Ej.: ${sample}`;
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "COMPLIANCE_EXPIRY",
          title: "Compliance: documentacion vencida",
          body,
          link: "/dashboard/compliance",
        },
      });
      complianceNotifications += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    suspendedTrials: suspended,
    complianceCritical: critical.length,
    complianceNotifications,
    ranAt: now.toISOString(),
  });
}
