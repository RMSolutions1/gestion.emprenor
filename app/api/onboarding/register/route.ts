export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { registerTenant } from "@/lib/onboarding";
import type { TenantPlan } from "@prisma/client";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  companyName: z.string().min(2).max(120),
  adminName: z.string().min(2).max(80),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8).max(72),
  plan: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
  industry: z.string().max(80).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`onboarding:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: "Demasiados intentos. Espere un minuto." }, { status: 429 });
    }
    const body = await req.json();
    const data = schema.parse(body);
    const { organization, admin } = await registerTenant({
      ...data,
      plan: data.plan as TenantPlan | undefined,
    });

    return NextResponse.json({
      organizationId: organization.id,
      slug: organization.slug,
      plan: organization.plan,
      trialEndsAt: organization.trialEndsAt,
      admin,
      loginUrl: "/login",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Datos invalidos" }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Error al registrar";
    const status = msg.includes("registrado") ? 400 : 500;
    console.error("Onboarding register:", err);
    return NextResponse.json({ error: msg }, { status });
  }
}
