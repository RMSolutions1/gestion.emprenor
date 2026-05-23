export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import type { TenantPlan } from "@prisma/client";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe || !secret) {
    return NextResponse.json({ received: true, mock: true });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Sin firma" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Webhook signature:", err);
    return NextResponse.json({ error: "Firma invalida" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.organizationId;
      const plan = session.metadata?.plan as TenantPlan | undefined;
      if (orgId) {
        await prisma.organization.update({
          where: { id: orgId },
          data: {
            status: "ACTIVE",
            plan: plan ?? undefined,
            stripeCustomerId: String(session.customer ?? ""),
            stripeSubscriptionId: String(session.subscription ?? ""),
            billingEmail: session.customer_details?.email ?? undefined,
          },
        });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.organizationId;
      const plan = sub.metadata?.plan as TenantPlan | undefined;
      if (orgId) {
        await prisma.organization.update({
          where: { id: orgId },
          data: {
            status: sub.status === "active" ? "ACTIVE" : "TRIAL",
            plan: plan ?? undefined,
            stripeSubscriptionId: sub.id,
          },
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.organizationId;
      if (orgId) {
        await prisma.organization.update({
          where: { id: orgId },
          data: { status: "SUSPENDED", stripeSubscriptionId: null },
        });
      }
    }
  } catch (err) {
    console.error("Webhook handler:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
