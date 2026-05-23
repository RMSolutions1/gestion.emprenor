import Stripe from "stripe";
import type { TenantPlan } from "@prisma/client";
import { getStripePriceId } from "@/lib/billing-plans";

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export async function createCheckoutSession(params: {
  customerId?: string | null;
  customerEmail: string;
  plan: TenantPlan;
  organizationId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();
  const priceId = getStripePriceId(params.plan);

  if (!stripe || !priceId) {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
    return {
      mock: true as const,
      url: `${base}/dashboard/billing?checkout=mock&plan=${params.plan}&org=${params.organizationId}`,
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: params.customerId ?? undefined,
    customer_email: params.customerId ? undefined : params.customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      organizationId: params.organizationId,
      plan: params.plan,
    },
    subscription_data: {
      metadata: {
        organizationId: params.organizationId,
        plan: params.plan,
      },
    },
  });

  return { mock: false as const, url: session.url!, sessionId: session.id };
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  const stripe = getStripe();
  if (!stripe) {
    return {
      mock: true as const,
      url: `${returnUrl}?portal=mock`,
    };
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return { mock: false as const, url: session.url };
}
