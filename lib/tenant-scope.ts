import { prisma } from "@/lib/db";
import { isPlatformOwner } from "@/lib/roles";

export type SessionUser = {
  id: string;
  role: string;
  organizationId?: string | null;
  email?: string;
  name?: string;
};

/** Carga organizationId desde DB si falta en sesión */
export async function enrichUserWithOrg(user: SessionUser): Promise<SessionUser> {
  if (user.organizationId || isPlatformOwner(user.role)) return user;
  const db = await prisma.user.findUnique({
    where: { id: user.id },
    select: { organizationId: true },
  });
  return { ...user, organizationId: db?.organizationId ?? null };
}

/** Filtro Prisma por tenant — platform owner sin filtro */
export function orgFilter(user: SessionUser): { organizationId?: string } {
  if (isPlatformOwner(user.role)) return {};
  if (!user.organizationId) return { organizationId: "__none__" };
  return { organizationId: user.organizationId };
}

export async function assertOrgAccess(user: SessionUser, organizationId: string) {
  if (isPlatformOwner(user.role)) return true;
  return user.organizationId === organizationId;
}

export async function getProjectOrgId(projectId: string) {
  const p = await prisma.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  });
  return p?.organizationId ?? null;
}

export async function assertProjectInTenant(user: SessionUser, projectId: string) {
  if (isPlatformOwner(user.role)) return true;
  const orgId = await getProjectOrgId(projectId);
  if (!orgId) return false;
  return assertOrgAccess(user, orgId);
}
