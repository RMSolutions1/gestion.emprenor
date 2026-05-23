"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/api-helpers";
import { orgFilter } from "@/lib/tenant-scope";
import { isPlatformOwner } from "@/lib/roles";
import { createUserSchema } from "@/lib/schemas";
import { getAdminDirectory, type AdminDirectorySnapshot } from "@/lib/data/directory";
import type { Role } from "@prisma/client";

export async function fetchAdminDirectory(): Promise<
  { ok: true; data: AdminDirectorySnapshot } | { ok: false; error: string }
> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "No autorizado" };
  if (user.role !== "ADMIN" && !isPlatformOwner(user.role)) {
    return { ok: false, error: "Sin permisos" };
  }
  const data = await getAdminDirectory(user);
  return { ok: true, data };
}

export async function createDirectoryUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
  organizationId?: string;
}) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "No autorizado" };
  if (user.role !== "ADMIN" && !isPlatformOwner(user.role)) {
    return { ok: false as const, error: "Sin permisos" };
  }

  try {
    const validated = createUserSchema.parse(input);
    const orgId = isPlatformOwner(user.role)
      ? input.organizationId ?? null
      : user.organizationId;

    if (!orgId && validated.role !== "PLATFORM_OWNER") {
      return { ok: false as const, error: "Organizacion requerida" };
    }

    const existing = await prisma.user.findUnique({ where: { email: validated.email } });
    if (existing) return { ok: false as const, error: "Email ya registrado" };

    const hashed = await bcrypt.hash(validated.password, 10);
    const created = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashed,
        name: validated.name,
        role: validated.role,
        organizationId: validated.role === "PLATFORM_OWNER" ? null : orgId,
      },
    });

    if (validated.role === "CLIENTE") {
      await prisma.clientProfile.create({
        data: { userId: created.id, entityType: "EMPRESA" },
      });
    }

    revalidatePath("/dashboard/administracion");
    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/team");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Error al crear" };
  }
}

export async function deleteDirectoryUser(userId: string) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "No autorizado" };
  if (user.role !== "ADMIN" && !isPlatformOwner(user.role)) {
    return { ok: false as const, error: "Sin permisos" };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, organizationId: true },
  });
  if (!target) return { ok: false as const, error: "Usuario no encontrado" };
  if (target.role === "PLATFORM_OWNER") {
    return { ok: false as const, error: "No se puede eliminar al owner" };
  }

  if (!isPlatformOwner(user.role)) {
    const filter = orgFilter(user);
    if (target.organizationId !== filter.organizationId) {
      return { ok: false as const, error: "Usuario fuera de su organizacion" };
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/dashboard/administracion");
  return { ok: true as const };
}

export async function updateOrganizationProfile(input: {
  name?: string;
  legalName?: string;
  billingEmail?: string;
  industry?: string;
}) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "No autorizado" };
  if (user.role !== "ADMIN" && !isPlatformOwner(user.role)) {
    return { ok: false as const, error: "Sin permisos" };
  }

  const orgId = user.organizationId;
  if (!orgId && !isPlatformOwner(user.role)) {
    return { ok: false as const, error: "Sin organizacion" };
  }
  if (!orgId) return { ok: false as const, error: "Seleccione tenant en plataforma" };

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.legalName !== undefined && { legalName: input.legalName || null }),
      ...(input.billingEmail !== undefined && { billingEmail: input.billingEmail || null }),
      ...(input.industry !== undefined && { industry: input.industry || null }),
    },
  });

  revalidatePath("/dashboard/administracion");
  return { ok: true as const };
}
