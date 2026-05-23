export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { createBillingPortalSession } from "@/lib/stripe";

export async function POST() {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const orgId = user!.organizationId;
    if (!orgId) return NextResponse.json({ error: "Sin organizacion" }, { status: 400 });

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org?.stripeCustomerId) {
      const base = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
      return NextResponse.json({
        mock: true,
        url: `${base}/dashboard/billing?portal=mock`,
      });
    }

    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
    const session = await createBillingPortalSession(
      org.stripeCustomerId,
      `${base}/dashboard/billing`
    );
    return NextResponse.json(session);
  } catch (err) {
    console.error("Billing portal:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
