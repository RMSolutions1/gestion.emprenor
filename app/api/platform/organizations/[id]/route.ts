export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePlatformOwner } from "@/lib/platform-auth";
import { recordAudit } from "@/lib/operational-events";
import type { OrganizationStatus, TenantPlan } from "@prisma/client";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "CHURNED"]).optional(),
  plan: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { authorized, session } = await requirePlatformOwner();
  if (!authorized) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  try {
    const body = patchSchema.parse(await req.json());
    const org = await prisma.organization.update({
      where: { id: params.id },
      data: {
        status: body.status as OrganizationStatus | undefined,
        plan: body.plan as TenantPlan | undefined,
      },
    });

    await recordAudit({
      actorId: (session?.user as { id?: string })?.id,
      action: "ORG_UPDATED",
      resource: "Organization",
      resourceId: org.id,
      metadata: body,
    });

    return NextResponse.json(org);
  } catch (err) {
    console.error("Org PATCH:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
