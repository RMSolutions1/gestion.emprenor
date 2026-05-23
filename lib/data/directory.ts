import { prisma } from "@/lib/db";
import { orgFilter, type SessionUser } from "@/lib/tenant-scope";
import { isPlatformOwner, roleLabel, SPECIALIST_ROLES } from "@/lib/roles";
import type { Role } from "@prisma/client";
import {
  computeProfileCompleteness,
  mergeDemoClientHints,
  profileFromDb,
} from "@/lib/client-profile";

export type DirectoryUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  roleLabel: string;
  organizationId: string | null;
  organizationName: string | null;
  createdAt: string;
  projectCount: number;
  profileCompleteness?: number;
};

export type DirectoryProject = {
  id: string;
  name: string;
  address: string;
  status: string;
  siteType: string;
  clientNames: string[];
  workersCount: number;
};

export type DirectoryOrganization = {
  id: string;
  name: string;
  legalName: string | null;
  slug: string;
  plan: string;
  status: string;
  billingEmail: string | null;
  industry: string | null;
  userCount: number;
  projectCount: number;
};

export type AdminDirectorySnapshot = {
  scope: "platform" | "tenant";
  organization: DirectoryOrganization | null;
  organizations: DirectoryOrganization[];
  clients: DirectoryUser[];
  employees: DirectoryUser[];
  projects: DirectoryProject[];
  stats: {
    clients: number;
    employees: number;
    projects: number;
    workersOnSite: number;
  };
};

function userKind(role: Role): "client" | "employee" | "other" {
  if (role === "CLIENTE") return "client";
  if ((SPECIALIST_ROLES as readonly string[]).includes(role) || role === "ADMIN") {
    return "employee";
  }
  return "other";
}

export async function getAdminDirectory(user: SessionUser): Promise<AdminDirectorySnapshot> {
  const filter = orgFilter(user);
  const platform = isPlatformOwner(user.role);

  const orgWhere = platform
    ? {}
    : user.organizationId
      ? { id: user.organizationId }
      : { id: "__none__" };
  const userWhere = platform ? {} : filter;
  const projectWhere = platform ? {} : filter;

  const [organizations, users, projects, workersCount] = await Promise.all([
    prisma.organization.findMany({
      where: orgWhere,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { users: true, projects: true } },
      },
    }),
    prisma.user.findMany({
      where: {
        ...userWhere,
        role: { not: "PLATFORM_OWNER" },
      },
      orderBy: { name: "asc" },
      include: {
        organization: { select: { id: true, name: true } },
        clientProfile: true,
        _count: { select: { assignments: true } },
      },
    }),
    prisma.project.findMany({
      where: projectWhere,
      orderBy: { updatedAt: "desc" },
      include: {
        assignments: {
          include: { user: { select: { name: true, role: true } } },
        },
        _count: { select: { workers: true } },
      },
    }),
    prisma.worker.count({
      where: platform
        ? {}
        : { project: { organizationId: user.organizationId ?? "__none__" } },
    }),
  ]);

  const mapUser = (u: (typeof users)[0]): DirectoryUser => {
    let profileCompleteness: number | undefined;
    if (u.role === "CLIENTE") {
      const raw = u.clientProfile ? profileFromDb(u.clientProfile) : null;
      const merged = mergeDemoClientHints(u.email, raw);
      profileCompleteness = computeProfileCompleteness(merged).percent;
    }
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      roleLabel: roleLabel(u.role),
      organizationId: u.organizationId,
      organizationName: u.organization?.name ?? null,
      createdAt: u.createdAt.toISOString(),
      projectCount: u._count.assignments,
      profileCompleteness,
    };
  };

  const clients = users.filter((u) => userKind(u.role) === "client").map(mapUser);
  const employees = users.filter((u) => userKind(u.role) === "employee").map(mapUser);

  const mapOrg = (o: (typeof organizations)[0]): DirectoryOrganization => ({
    id: o.id,
    name: o.name,
    legalName: o.legalName,
    slug: o.slug,
    plan: o.plan,
    status: o.status,
    billingEmail: o.billingEmail,
    industry: o.industry,
    userCount: o._count.users,
    projectCount: o._count.projects,
  });

  const directoryProjects: DirectoryProject[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    address: p.address,
    status: p.status,
    siteType: p.siteType,
    clientNames: p.assignments
      .filter((a) => a.user.role === "CLIENTE")
      .map((a) => a.user.name),
    workersCount: p._count.workers,
  }));

  const primaryOrg =
    platform && organizations.length === 1
      ? mapOrg(organizations[0])
      : !platform && organizations[0]
        ? mapOrg(organizations.find((o) => o.id === user.organizationId) ?? organizations[0])
        : null;

  return {
    scope: platform ? "platform" : "tenant",
    organization: primaryOrg,
    organizations: organizations.map(mapOrg),
    clients,
    employees,
    projects: directoryProjects,
    stats: {
      clients: clients.length,
      employees: employees.length,
      projects: directoryProjects.length,
      workersOnSite: workersCount,
    },
  };
}
