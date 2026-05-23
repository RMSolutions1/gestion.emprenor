export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { BILLING_PLANS, getPlanConfig } from "@/lib/billing-plans";
import { isStripeConfigured } from "@/lib/stripe";

export async function GET() {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const orgId = user!.organizationId;
    if (!orgId) {
      return NextResponse.json({ error: "Sin organizacion" }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        plan: true,
        status: true,
        trialEndsAt: true,
        billingEmail: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });
    if (!org) return NextResponse.json({ error: "Organizacion no encontrada" }, { status: 404 });

    const trialActive = org.trialEndsAt ? org.trialEndsAt > new Date() : false;
    const daysLeft = org.trialEndsAt
      ? Math.max(0, Math.ceil((org.trialEndsAt.getTime() - Date.now()) / 86400000))
      : 0;

    return NextResponse.json({
      organization: org,
      planConfig: getPlanConfig(org.plan),
      plans: BILLING_PLANS,
      stripeConfigured: isStripeConfigured(),
      trialActive,
      trialDaysLeft: daysLeft,
    });
  } catch (err) {
    console.error("Billing status:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
