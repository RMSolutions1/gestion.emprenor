import { prisma } from "@/lib/db";
import { evaluateVehicleCompliance, evaluateWorkerCompliance, isExpired } from "@/lib/compliance";

export type ExpiryAlert = {
  id: string;
  kind: "worker" | "vehicle";
  name: string;
  projectId: string;
  projectName: string;
  issues: string[];
  level: "VENCIDO" | "PROXIMO";
};

function isSoon(date: Date | string | null | undefined, days = 30): boolean {
  if (!date) return false;
  const d = new Date(date);
  const limit = Date.now() + days * 24 * 60 * 60 * 1000;
  return d.getTime() <= limit && d.getTime() >= Date.now();
}

export async function getComplianceExpiryAlerts(projectIds?: string[]): Promise<ExpiryAlert[]> {
  const where = projectIds?.length ? { projectId: { in: projectIds } } : {};

  const [workers, vehicles] = await Promise.all([
    prisma.worker.findMany({
      where,
      include: { project: { select: { name: true, siteType: true } } },
    }),
    prisma.vehicle.findMany({
      where,
      include: { project: { select: { name: true } } },
    }),
  ]);

  const alerts: ExpiryAlert[] = [];

  for (const w of workers) {
    const requireBg = w.project.siteType === "BARRIO_PRIVADO";
    const { issues, level } = evaluateWorkerCompliance(w, { requireBackgroundCheck: requireBg });
    const dateIssues: string[] = [];
    if (isExpired(w.artExpiry)) dateIssues.push("ART vencida");
    else if (isSoon(w.artExpiry)) dateIssues.push("ART por vencer (30d)");
    if (isExpired(w.lifeInsuranceExpiry)) dateIssues.push("Seguro de vida vencido");
    else if (isSoon(w.lifeInsuranceExpiry)) dateIssues.push("Seguro por vencer (30d)");

    const allIssues = [...new Set([...issues, ...dateIssues])];
    if (allIssues.length === 0) continue;

    const hasExpired =
      level === "VENCIDO" || dateIssues.some((i) => i.includes("vencid"));
    alerts.push({
      id: w.id,
      kind: "worker",
      name: w.name,
      projectId: w.projectId,
      projectName: w.project.name,
      issues: allIssues.slice(0, 4),
      level: hasExpired ? "VENCIDO" : "PROXIMO",
    });
  }

  for (const v of vehicles) {
    const { issues, level } = evaluateVehicleCompliance(v);
    const dateIssues: string[] = [];
    if (isExpired(v.technicalReviewExpiry)) dateIssues.push("VTV vencida");
    else if (isSoon(v.technicalReviewExpiry)) dateIssues.push("VTV por vencer (30d)");
    if (isExpired(v.insuranceExpiry)) dateIssues.push("Seguro vencido");
    else if (isSoon(v.insuranceExpiry)) dateIssues.push("Seguro por vencer (30d)");

    const allIssues = [...new Set([...issues, ...dateIssues])];
    if (allIssues.length === 0) continue;

    alerts.push({
      id: v.id,
      kind: "vehicle",
      name: v.label,
      projectId: v.projectId,
      projectName: v.project.name,
      issues: allIssues.slice(0, 4),
      level: level === "VENCIDO" ? "VENCIDO" : "PROXIMO",
    });
  }

  return alerts.sort((a, b) => (a.level === "VENCIDO" ? -1 : 1));
}
