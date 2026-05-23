/** Evaluación de legajo y documentación para personal y vehículos */

export type ComplianceLevel = "COMPLETO" | "INCOMPLETO" | "VENCIDO";

export type ComplianceResult = {
  level: ComplianceLevel;
  issues: string[];
  score: number;
};

function isExpired(date: Date | string | null | undefined): boolean {
  if (!date) return true;
  return new Date(date) < new Date();
}

function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function evaluateWorkerCompliance(
  worker: {
    dni?: string | null;
    cuil?: string | null;
    cuit?: string | null;
    artNumber?: string | null;
    artExpiry?: Date | string | null;
    lifeInsuranceExpiry?: Date | string | null;
    eppComplete?: boolean;
    habilitationNotes?: string | null;
    backgroundCheckStatus?: string | null;
    backgroundCheckDate?: Date | string | null;
  },
  options?: { requireBackgroundCheck?: boolean }
): ComplianceResult {
  const issues: string[] = [];
  const requireBg = options?.requireBackgroundCheck ?? false;

  if (!worker.dni?.trim()) issues.push("Falta DNI");
  if (!worker.cuil?.trim() && !worker.cuit?.trim()) issues.push("Falta CUIL o CUIT");
  if (!worker.artNumber?.trim()) issues.push("Falta numero de ART");
  if (isExpired(worker.artExpiry)) issues.push("ART vencida o sin fecha");
  if (isExpired(worker.lifeInsuranceExpiry)) issues.push("Seguro de vida vencido o sin fecha");
  if (!worker.eppComplete) issues.push("EPP no registrado como entregado");
  if (!worker.habilitationNotes?.trim()) issues.push("Sin notas de habilitacion/capacitacion");

  if (requireBg) {
    if (worker.backgroundCheckStatus === "PENDIENTE" || worker.backgroundCheckStatus === "NO_APLICA") {
      issues.push("Antecedentes pendientes o no cargados");
    }
    if (worker.backgroundCheckStatus === "RECHAZADO") {
      issues.push("Antecedentes rechazados");
    }
  }

  const hasExpired =
    isExpired(worker.artExpiry) || isExpired(worker.lifeInsuranceExpiry);

  const level: ComplianceLevel =
    issues.length === 0 ? "COMPLETO" : hasExpired ? "VENCIDO" : "INCOMPLETO";

  const totalChecks = requireBg ? 9 : 7;
  const score = Math.round(((totalChecks - issues.length) / totalChecks) * 100);

  return { level, issues, score };
}

export function evaluateVehicleCompliance(vehicle: {
  plate?: string | null;
  driverName?: string | null;
  driverLicense?: string | null;
  driverLicenseExpiry?: Date | string | null;
  technicalReviewExpiry?: Date | string | null;
  insuranceExpiry?: Date | string | null;
  artExpiry?: Date | string | null;
}): ComplianceResult {
  const issues: string[] = [];

  if (!vehicle.plate?.trim()) issues.push("Falta patente");
  if (!vehicle.driverName?.trim()) issues.push("Falta nombre del conductor");
  if (!vehicle.driverLicense?.trim()) issues.push("Falta licencia de conducir");
  if (isExpired(vehicle.driverLicenseExpiry)) issues.push("Licencia de conductor vencida");
  if (isExpired(vehicle.technicalReviewExpiry)) issues.push("VTV / revision tecnica vencida");
  if (isExpired(vehicle.insuranceExpiry)) issues.push("Seguro del vehiculo vencido");
  if (isExpired(vehicle.artExpiry)) issues.push("ART del vehiculo vencida");

  const hasExpired =
    isExpired(vehicle.driverLicenseExpiry) ||
    isExpired(vehicle.technicalReviewExpiry) ||
    isExpired(vehicle.insuranceExpiry) ||
    isExpired(vehicle.artExpiry);

  const level: ComplianceLevel =
    issues.length === 0 ? "COMPLETO" : hasExpired ? "VENCIDO" : "INCOMPLETO";

  const totalChecks = 7;
  const score = Math.round(((totalChecks - issues.length) / totalChecks) * 100);

  return { level, issues, score };
}

export function complianceLabel(level: ComplianceLevel): string {
  switch (level) {
    case "COMPLETO":
      return "En regla";
    case "VENCIDO":
      return "Documentacion vencida";
    default:
      return "Legajo incompleto";
  }
}

export function complianceBadgeClass(level: ComplianceLevel): string {
  switch (level) {
    case "COMPLETO":
      return "bg-green-100 text-green-800";
    case "VENCIDO":
      return "bg-red-100 text-red-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

export { daysUntil, isExpired };
