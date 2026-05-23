export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { upsertClientProfileSchema } from "@/lib/schemas";
import {
  computeProfileCompleteness,
  mergeDemoClientHints,
  profileFromDb,
} from "@/lib/client-profile";

async function canAccessClientProfile(
  actorId: string,
  actorRole: string,
  targetUserId: string
): Promise<boolean> {
  if (actorRole === "ADMIN" || actorRole === "PLATFORM_OWNER") return true;
  if (actorRole === "CLIENTE" && actorId === targetUserId) return true;
  return false;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const allowed = await canAccessClientProfile(user!.id, user!.role, params.id);
    if (!allowed) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true, role: true, clientProfile: true },
    });
    if (!target || target.role !== "CLIENTE") {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const raw = target.clientProfile ? profileFromDb(target.clientProfile) : null;
    const merged = mergeDemoClientHints(target.email, raw);
    const completeness = computeProfileCompleteness(merged);

    return NextResponse.json({
      user: { id: target.id, name: target.name, email: target.email },
      profile: merged,
      completeness,
    });
  } catch (err) {
    console.error("ClientProfile GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const allowed = await canAccessClientProfile(user!.id, user!.role, params.id);
    if (!allowed) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, role: true, email: true },
    });
    if (!target || target.role !== "CLIENTE") {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const body = upsertClientProfileSchema.parse(await req.json());
    const isClientSelf = user!.role === "CLIENTE";
    const data = {
      ...(body.entityType !== undefined && { entityType: body.entityType }),
      ...(body.legalName !== undefined && { legalName: body.legalName }),
      ...(body.taxId !== undefined && { taxId: body.taxId }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.mobilePhone !== undefined && { mobilePhone: body.mobilePhone }),
      ...(body.contactRole !== undefined && { contactRole: body.contactRole }),
      ...(body.billingAddress !== undefined && { billingAddress: body.billingAddress }),
      ...(body.city !== undefined && { city: body.city }),
      ...(body.province !== undefined && { province: body.province }),
      ...(body.postalCode !== undefined && { postalCode: body.postalCode }),
      ...(body.country !== undefined && { country: body.country }),
      ...(body.sector !== undefined && { sector: body.sector }),
      ...(!isClientSelf && body.notes !== undefined && { notes: body.notes }),
    };

    const row = await prisma.clientProfile.upsert({
      where: { userId: params.id },
      create: {
        userId: params.id,
        entityType: body.entityType ?? "EMPRESA",
        ...data,
      },
      update: data,
    });

    const profile = profileFromDb(row);
    const completeness = computeProfileCompleteness(profile);

    return NextResponse.json({ profile, completeness });
  } catch (err) {
    console.error("ClientProfile PATCH:", err);
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 });
  }
}
