/** POL-GAR-001 — Garantía mínima de servicios Emprenor */

export const MIN_WARRANTY_DAYS = 120;

export type WarrantyStatus = "SIN_RECEPCION" | "LISTA_RECEPCION" | "VIGENTE" | "VENCIDA";

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function computeWarrantyEnd(start: Date, days = MIN_WARRANTY_DAYS): Date {
  return addDays(start, days);
}

export function getWarrantyStatus(project: {
  receptionAt?: Date | string | null;
  receptionReadyAt?: Date | string | null;
  warrantyEndAt?: Date | string | null;
}): WarrantyStatus {
  if (project.receptionAt) {
    const end = project.warrantyEndAt ? new Date(project.warrantyEndAt) : null;
    if (end && end.getTime() < Date.now()) return "VENCIDA";
    return "VIGENTE";
  }
  if (project.receptionReadyAt) return "LISTA_RECEPCION";
  return "SIN_RECEPCION";
}

export function warrantyDaysRemaining(warrantyEndAt: Date | string | null | undefined): number | null {
  if (!warrantyEndAt) return null;
  const end = new Date(warrantyEndAt);
  const diff = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export const WARRANTY_STATUS_LABELS: Record<WarrantyStatus, string> = {
  SIN_RECEPCION: "Obra en curso — sin recepción final",
  LISTA_RECEPCION: "Pendiente de su conformidad (recepción)",
  VIGENTE: "Garantía de servicio vigente",
  VENCIDA: "Garantía finalizada",
};
