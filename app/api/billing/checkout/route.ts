export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { createCheckoutSession } from "@/lib/stripe";
import type { TenantPlan } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]),
});

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const orgId = user!.organizationId;
    if (!orgId) return NextResponse.json({ error: "Sin organizacion" }, { status: 400 });

    const { plan } = schema.parse(await req.json());
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) return NextResponse.json({ error: "Organizacion no encontrada" }, { status: 404 });

    if (plan === "ENTERPRISE" && !process.env.STRIPE_PRICE_ENTERPRISE) {
      return NextResponse.json(
        { error: "Enterprise requiere contacto comercial. Escribinos a ventas@emprenor.com" },
        { status: 400 }
      );
    }

    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
    const result = await createCheckoutSession({
      customerId: org.stripeCustomerId,
      customerEmail: org.billingEmail ?? user!.email ?? "",
      plan: plan as TenantPlan,
      organizationId: org.id,
      successUrl: `${base}/dashboard/billing?success=1`,
      cancelUrl: `${base}/dashboard/billing?canceled=1`,
    });

    if (result.mock) {
      await prisma.organization.update({
        where: { id: org.id },
        data: { plan: plan as TenantPlan, status: "ACTIVE" },
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Billing checkout:", err);
    return NextResponse.json({ error: "Error al iniciar pago" }, { status: 500 });
  }
}
