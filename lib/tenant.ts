import { prisma } from "@/lib/db";

const DEFAULT_SLUG = "emprenor-demo";

/** Resuelve organización por slug (subdominio futuro) o id de sesión */
export async function resolveOrganization(opts: {
  slug?: string | null;
  organizationId?: string | null;
}) {
  if (opts.organizationId) {
    return prisma.organization.findUnique({
      where: { id: opts.organizationId },
      include: { branding: true },
    });
  }
  const slug = opts.slug ?? DEFAULT_SLUG;
  return prisma.organization.findUnique({
    where: { slug },
    include: { branding: true },
  });
}

export function extractTenantSlugFromHost(host: string): string | null {
  const base = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost";
  if (!host || host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return null;
  }
  const parts = host.split(".");
  const baseParts = base.split(".").length;
  if (parts.length > baseParts) {
    return parts[0];
  }
  return null;
}

export async function getDefaultOrganizationId(): Promise<string | null> {
  const org = await prisma.organization.findUnique({
    where: { slug: DEFAULT_SLUG },
    select: { id: true },
  });
  return org?.id ?? null;
}
