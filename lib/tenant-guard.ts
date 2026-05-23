import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { isPlatformOwner } from "@/lib/roles";
import type { SessionUser as ScopeUser } from "@/lib/tenant-scope";

export async function assertOrganizationActive(user: ScopeUser) {
  if (isPlatformOwner(user.role)) return null;
  if (!user.organizationId) {
    return NextResponse.json(
      { error: "Usuario sin organizacion asignada", code: "NO_ORG" },
      { status: 403 }
    );
  }

  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { status: true, name: true, trialEndsAt: true },
  });

  if (!org) {
    return NextResponse.json({ error: "Organizacion no encontrada" }, { status: 403 });
  }

  if (org.status === "SUSPENDED" || org.status === "CHURNED") {
    return NextResponse.json(
      {
        error: `Cuenta suspendida (${org.name}). Contacte a soporte o active su plan en Facturacion.`,
        code: "ORG_SUSPENDED",
      },
      { status: 403 }
    );
  }

  if (org.status === "TRIAL" && org.trialEndsAt && org.trialEndsAt < new Date()) {
    return NextResponse.json(
      {
        error: "Periodo de prueba finalizado. Active un plan en Facturacion para continuar.",
        code: "TRIAL_EXPIRED",
      },
      { status: 402 }
    );
  }

  return null;
}
