import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { isAdmin, isPlatformOwner, isSpecialist } from "@/lib/roles";
import {
  enrichUserWithOrg,
  assertProjectInTenant,
  type SessionUser,
} from "@/lib/tenant-scope";
import { assertOrganizationActive } from "@/lib/tenant-guard";

export function parseListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { data?: T[] }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const raw = session.user as SessionUser;
  return enrichUserWithOrg(raw);
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }
  const orgBlock = await assertOrganizationActive(user);
  if (orgBlock) return { user: null, error: orgBlock };
  return { user, error: null };
}

export async function requireAdmin() {
  const { user, error } = await requireAuth();
  if (error) return { user: null, error };
  if (user!.role !== "ADMIN" && !isPlatformOwner(user!.role)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Sin permisos" }, { status: 403 }),
    };
  }
  return { user, error: null };
}

export async function assertProjectAccess(userId: string, role: string, projectId: string) {
  const user = await enrichUserWithOrg({ id: userId, role });
  if (!(await assertProjectInTenant(user, projectId))) return false;
  if (isAdmin(role) || isPlatformOwner(role)) return true;
  const assignment = await prisma.projectAssignment.findFirst({
    where: { userId, projectId },
  });
  return !!assignment;
}

export async function requireStaff() {
  const { user, error } = await requireAuth();
  if (error) return { user: null, error };
  if (!isAdmin(user!.role) && !isSpecialist(user!.role)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Sin permisos" }, { status: 403 }),
    };
  }
  return { user, error: null };
}

export async function requireProjectAccess(projectId: string) {
  const { user, error } = await requireAuth();
  if (error) return { user: null, error };
  const ok = await assertProjectAccess(user!.id, user!.role, projectId);
  if (!ok) {
    return {
      user: null,
      error: NextResponse.json({ error: "Sin acceso al proyecto" }, { status: 403 }),
    };
  }
  return { user, error: null };
}
