import type { TenantPlan } from "@prisma/client";

export type PlanConfig = {
  plan: TenantPlan;
  name: string;
  priceLabel: string;
  priceUsdMonthly: number;
  description: string;
  stripePriceEnv: string;
  trialDays: number;
};

export const BILLING_PLANS: PlanConfig[] = [
  {
    plan: "STARTER",
    name: "Starter",
    priceLabel: "USD 299",
    priceUsdMonthly: 299,
    description: "Hasta 25 usuarios, 5 proyectos activos",
    stripePriceEnv: "STRIPE_PRICE_STARTER",
    trialDays: 14,
  },
  {
    plan: "PROFESSIONAL",
    name: "Professional",
    priceLabel: "USD 899",
    priceUsdMonthly: 899,
    description: "Multi-obra, chat RT, QMS y HSE",
    stripePriceEnv: "STRIPE_PRICE_PROFESSIONAL",
    trialDays: 14,
  },
  {
    plan: "ENTERPRISE",
    name: "Enterprise",
    priceLabel: "Custom",
    priceUsdMonthly: 0,
    description: "Dominio propio, SLA 99.9%, IA y SSO",
    stripePriceEnv: "STRIPE_PRICE_ENTERPRISE",
    trialDays: 30,
  },
];

export function getPlanConfig(plan: TenantPlan) {
  return BILLING_PLANS.find((p) => p.plan === plan) ?? BILLING_PLANS[0];
}

export function getStripePriceId(plan: TenantPlan): string | null {
  const cfg = getPlanConfig(plan);
  return process.env[cfg.stripePriceEnv] ?? null;
}
