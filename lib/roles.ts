/** Roles y permisos del portal Emprenor */

export const SPECIALIST_ROLES = [
  "INGENIERO_CIVIL",
  "ARQUITECTO",
  "INGENIERO_ELECTRICO",
  "INSPECTOR_CALIDAD",
  "INSPECTOR_OBRA",
] as const;

export type SpecialistRole = (typeof SPECIALIST_ROLES)[number];

export const ROLE_LABELS: Record<string, string> = {
  PLATFORM_OWNER: "Propietario plataforma",
  ADMIN: "Administrador",
  CLIENTE: "Cliente",
  INGENIERO_CIVIL: "Ingeniero civil",
  ARQUITECTO: "Arquitecto",
  INGENIERO_ELECTRICO: "Ingeniero electrico",
  INSPECTOR_CALIDAD: "Inspector de calidad",
  INSPECTOR_OBRA: "Inspector de obra",
};

export const SITE_TYPE_LABELS: Record<string, string> = {
  OBRA_GENERAL: "Obra general",
  BARRIO_PRIVADO: "Barrio privado / country",
  INDUSTRIA: "Planta industrial",
  COMERCIAL: "Comercial",
  RESIDENCIAL: "Residencial",
  OIL_GAS: "Oil & Gas / proceso",
  MINERIA: "Minería / site remoto",
  ENERGIA: "Energía y redes",
  AGRO: "Agroindustria",
  INFRAESTRUCTURA: "Infraestructura y obra civil",
  SERVICIOS_PUBLICOS: "Servicios públicos / regulado",
};

export const SITE_TYPE_OPTIONS = Object.entries(SITE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function isPlatformOwner(role?: string | null) {
  return role === "PLATFORM_OWNER";
}

export function isAdmin(role?: string | null) {
  return role === "ADMIN";
}

export function isTenantAdmin(role?: string | null) {
  return role === "ADMIN";
}

export function isCliente(role?: string | null) {
  return role === "CLIENTE";
}

export function isSpecialist(role?: string | null): role is SpecialistRole {
  return !!role && SPECIALIST_ROLES.includes(role as SpecialistRole);
}

export function isInternalStaff(role?: string | null) {
  return isAdmin(role) || isSpecialist(role);
}

export function roleLabel(role?: string | null) {
  return ROLE_LABELS[role ?? ""] ?? role ?? "Usuario";
}

export function canManageProject(role?: string | null) {
  return isAdmin(role);
}

export function canCreateTechnicalReport(role?: string | null) {
  return isAdmin(role) || isSpecialist(role);
}

export function canApproveAsClient(role?: string | null) {
  return isCliente(role);
}
