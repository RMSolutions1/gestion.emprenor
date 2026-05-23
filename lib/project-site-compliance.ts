import { getRequirementsForSiteType } from "@/lib/site-requirements";
import { evaluateVehicleCompliance, evaluateWorkerCompliance, isExpired } from "@/lib/compliance";

type WorkerRow = {
  dni?: string | null;
  cuil?: string | null;
  cuit?: string | null;
  artNumber?: string | null;
  artExpiry?: Date | string | null;
  lifeInsuranceExpiry?: Date | string | null;
  eppComplete?: boolean;
  backgroundCheckStatus?: string | null;
};

type VehicleRow = {
  plate?: string | null;
  driverName?: string | null;
  driverLicense?: string | null;
  driverLicenseExpiry?: Date | string | null;
  technicalReviewExpiry?: Date | string | null;
  insuranceExpiry?: Date | string | null;
  artExpiry?: Date | string | null;
};

export type ProjectSiteCompliance = {
  siteType: string;
  complete: boolean;
  completionPercent: number;
  missing: Array<{ id: string; label: string; category: string }>;
  checks: Record<string, boolean>;
};

function workersOk(workers: WorkerRow[]) {
  return workers.length > 0;
}

export function evaluateProjectSiteCompliance(input: {
  siteType: string;
  workers: WorkerRow[];
  vehicles: VehicleRow[];
  materialsCount: number;
  planosCount: number;
  reportsCount: number;
  permitsApprovedCount?: number;
  hasLiabilityInsurance?: boolean;
  hseInspectionsCount?: number;
  materialsWithDocsCount?: number;
}): ProjectSiteCompliance {
  const {
    siteType,
    workers,
    vehicles,
    materialsCount,
    planosCount,
    reportsCount,
    permitsApprovedCount = 0,
    hasLiabilityInsurance = false,
    hseInspectionsCount = 0,
    materialsWithDocsCount = 0,
  } = input;
  const requireBg = siteType === "BARRIO_PRIVADO";
  const items = getRequirementsForSiteType(siteType);

  const checks: Record<string, boolean> = {
    dni: workersOk(workers) && workers.every((w) => !!w.dni?.trim()),
    cuil_cuit:
      workersOk(workers) && workers.every((w) => !!w.cuil?.trim() || !!w.cuit?.trim()),
    antecedentes: requireBg
      ? workersOk(workers) &&
        workers.every((w) => w.backgroundCheckStatus === "APROBADO")
      : workersOk(workers),
    art:
      workersOk(workers) &&
      workers.every((w) => {
        const { level, issues } = evaluateWorkerCompliance(w, { requireBackgroundCheck: false });
        return !!w.artNumber?.trim() && !issues.includes("ART vencida o sin fecha");
      }),
    seguro_vida:
      workersOk(workers) &&
      workers.every((w) => !isExpired(w.lifeInsuranceExpiry)),
    epp: workersOk(workers) && workers.every((w) => w.eppComplete === true),
    vehiculo_docs:
      vehicles.length > 0 &&
      vehicles.every((v) => evaluateVehicleCompliance(v).level === "COMPLETO"),
    licencia:
      vehicles.length > 0 &&
      vehicles.every((v) => !!v.driverLicense?.trim() && !isExpired(v.driverLicenseExpiry)),
    lista_materiales:
      materialsCount > 0 &&
      (siteType === "BARRIO_PRIVADO" ? materialsWithDocsCount > 0 : true),
    planos: planosCount > 0,
    informe_conformidad: reportsCount > 0,
    permiso_trabajo: permitsApprovedCount > 0,
    poliza_rc: hasLiabilityInsurance,
    itp: reportsCount > 0 && hseInspectionsCount > 0,
    ingreso_site:
      workersOk(workers) &&
      workers.every((w) => w.eppComplete === true && !!w.artNumber?.trim()),
    induccion_hse:
      workersOk(workers) &&
      workers.every((w) => w.eppComplete === true) &&
      hseInspectionsCount > 0,
  };

  const missing = items
    .filter((item) => !checks[item.id])
    .map((item) => ({ id: item.id, label: item.label, category: item.category }));

  const done = items.length - missing.length;
  const completionPercent = items.length ? Math.round((done / items.length) * 100) : 100;

  return {
    siteType,
    complete: missing.length === 0,
    completionPercent,
    missing,
    checks,
  };
}
