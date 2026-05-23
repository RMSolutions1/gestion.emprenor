import type { ClientEntityType, ClientProfile } from "@prisma/client";
import { clientByEmail } from "@/lib/emprenor-clients";

export const CLIENT_ENTITY_LABELS: Record<ClientEntityType, string> = {
  PARTICULAR: "Persona particular",
  EMPRESA: "Empresa / sociedad",
  COMERCIO: "Comercio (farmacia, local)",
  INDUSTRIA: "Industria / planta",
  PUBLICO: "Organismo publico",
  CONSORCIO: "Consorcio / barrio privado",
  FUNDACION: "Fundacion / ONG",
};

/** Campos que suman al score de ficha (mas info = mejor operacion) */
const COMPLETENESS_WEIGHTS: { key: keyof ClientProfileDTO; weight: number; label: string }[] = [
  { key: "entityType", weight: 10, label: "Tipo de cliente" },
  { key: "legalName", weight: 15, label: "Razon social / nombre legal" },
  { key: "taxId", weight: 15, label: "CUIT / identificacion fiscal" },
  { key: "phone", weight: 10, label: "Telefono" },
  { key: "mobilePhone", weight: 5, label: "Celular" },
  { key: "contactRole", weight: 5, label: "Cargo / area de contacto" },
  { key: "billingAddress", weight: 10, label: "Direccion" },
  { key: "city", weight: 8, label: "Ciudad" },
  { key: "province", weight: 7, label: "Provincia" },
  { key: "sector", weight: 10, label: "Rubro / sector" },
  { key: "notes", weight: 5, label: "Notas internas" },
];

export type ClientProfileDTO = {
  userId: string;
  entityType: ClientEntityType;
  legalName: string | null;
  taxId: string | null;
  phone: string | null;
  mobilePhone: string | null;
  contactRole: string | null;
  billingAddress: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string;
  sector: string | null;
  notes: string | null;
};

export function computeProfileCompleteness(
  profile: Partial<ClientProfileDTO> | null | undefined
): { percent: number; filled: number; total: number; missing: string[] } {
  if (!profile) {
    return {
      percent: 0,
      filled: 0,
      total: COMPLETENESS_WEIGHTS.length,
      missing: COMPLETENESS_WEIGHTS.map((f) => f.label),
    };
  }

  let score = 0;
  let max = 0;
  const missing: string[] = [];

  for (const { key, weight, label } of COMPLETENESS_WEIGHTS) {
    max += weight;
    const val = profile[key];
    const filled =
      key === "entityType"
        ? Boolean(val)
        : typeof val === "string"
          ? val.trim().length > 0
          : Boolean(val);
    if (filled) score += weight;
    else missing.push(label);
  }

  return {
    percent: max > 0 ? Math.round((score / max) * 100) : 0,
    filled: COMPLETENESS_WEIGHTS.length - missing.length,
    total: COMPLETENESS_WEIGHTS.length,
    missing,
  };
}

export function profileFromDb(row: ClientProfile): ClientProfileDTO {
  return {
    userId: row.userId,
    entityType: row.entityType,
    legalName: row.legalName,
    taxId: row.taxId,
    phone: row.phone,
    mobilePhone: row.mobilePhone,
    contactRole: row.contactRole,
    billingAddress: row.billingAddress,
    city: row.city,
    province: row.province,
    postalCode: row.postalCode,
    country: row.country,
    sector: row.sector,
    notes: row.notes,
  };
}

/** Enriquece desde cartera demo si la ficha en BD esta vacia */
export function mergeDemoClientHints(
  email: string,
  profile: ClientProfileDTO | null
): ClientProfileDTO | null {
  const demo = clientByEmail(email);
  if (!demo) return profile;

  const base: ClientProfileDTO = profile ?? {
    userId: "",
    entityType: "EMPRESA",
    legalName: null,
    taxId: null,
    phone: null,
    mobilePhone: null,
    contactRole: null,
    billingAddress: null,
    city: null,
    province: null,
    postalCode: null,
    country: "AR",
    sector: null,
    notes: null,
  };

  const siteToEntity: Record<string, ClientEntityType> = {
    BARRIO_PRIVADO: "CONSORCIO",
    SERVICIOS_PUBLICOS: "PUBLICO",
    INDUSTRIA: "INDUSTRIA",
    COMERCIAL: "COMERCIO",
  };

  return {
    ...base,
    legalName: base.legalName ?? demo.legalName,
    sector: base.sector ?? demo.sector,
    contactRole: base.contactRole ?? demo.contactName,
    billingAddress: base.billingAddress ?? demo.projectAddress,
    city: base.city ?? demo.location,
    entityType:
      base.legalName && base.sector
        ? base.entityType
        : (siteToEntity[demo.siteType] ?? "EMPRESA"),
  };
}

export function completenessTone(percent: number): "low" | "mid" | "high" {
  if (percent >= 80) return "high";
  if (percent >= 45) return "mid";
  return "low";
}
