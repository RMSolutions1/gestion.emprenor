import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ensureOrganizationChannel } from "@/lib/chat-service";
import type { TenantPlan } from "@prisma/client";
import { getPlanConfig } from "@/lib/billing-plans";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

async function uniqueSlug(base: string) {
  let slug = base || "empresa";
  let n = 0;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function registerTenant(params: {
  companyName: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  plan?: TenantPlan;
  industry?: string;
  country?: string;
}) {
  const email = params.adminEmail.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("El email ya esta registrado");
  }

  const plan = params.plan ?? "PROFESSIONAL";
  const trialDays = getPlanConfig(plan).trialDays;
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  const baseSlug = slugify(params.companyName);
  const slug = await uniqueSlug(baseSlug);
  const hashed = await bcrypt.hash(params.adminPassword, 10);

  const org = await prisma.organization.create({
    data: {
      name: params.companyName.trim(),
      slug,
      legalName: params.companyName.trim(),
      plan,
      status: "TRIAL",
      industry: params.industry?.trim() || "Construccion",
      country: params.country ?? "AR",
      billingEmail: email,
      trialEndsAt,
    },
  });

  await prisma.tenantBranding.create({
    data: { organizationId: org.id },
  });

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: params.adminName.trim(),
      role: "ADMIN",
      organizationId: org.id,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  await ensureOrganizationChannel(org.id, org.name);

  return { organization: org, admin };
}
