export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { isAdmin } from "@/lib/roles";
import { getComplianceExpiryAlerts } from "@/lib/compliance-alerts";

export async function GET() {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    let projectIds: string[] | undefined;
    if (!isAdmin(user!.role)) {
      const assignments = await prisma.projectAssignment.findMany({
        where: { userId: user!.id },
        select: { projectId: true },
      });
      projectIds = assignments.map((a) => a.projectId);
    }

    const alerts = await getComplianceExpiryAlerts(projectIds);
    return NextResponse.json({
      alerts,
      summary: {
        total: alerts.length,
        expired: alerts.filter((a) => a.level === "VENCIDO").length,
        soon: alerts.filter((a) => a.level === "PROXIMO").length,
      },
    });
  } catch (err) {
    console.error("Expiry alerts GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
