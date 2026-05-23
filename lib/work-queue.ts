import { prisma } from "@/lib/db";
import { orgFilter, type SessionUser } from "@/lib/tenant-scope";
import { evaluateWorkerCompliance, evaluateVehicleCompliance, isExpired } from "@/lib/compliance";
import { isPlatformOwner } from "@/lib/roles";

export type WorkQueueItem = {
  id: string;
  kind: string;
  priority: "urgent" | "high" | "normal";
  title: string;
  detail?: string;
  projectId?: string;
  projectName?: string;
  link: string;
  dueAt?: string;
};

const PRIORITY_ORDER = { urgent: 0, high: 1, normal: 2 };

export async function buildWorkQueue(user: SessionUser): Promise<{
  items: WorkQueueItem[];
  counts: Record<string, number>;
}> {
  const tenant = orgFilter(user);
  const projectWhere = isPlatformOwner(user.role) ? {} : { organizationId: tenant.organizationId };

  const projects = await prisma.project.findMany({
    where: projectWhere,
    select: { id: true, name: true, siteType: true, liabilityInsuranceExpiry: true },
  });
  const projectIds = projects.map((p) => p.id);
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

  const items: WorkQueueItem[] = [];
  const now = new Date();

  if (projectIds.length === 0) {
    return { items: [], counts: {} };
  }

  const [
    overdueTasks,
    pendingExtras,
    pendingReports,
    openIncidents,
    overdueMilestones,
    pendingMaterials,
    overdueWorkOrders,
    openNC,
    workers,
    vehicles,
    projectsNoPlanos,
  ] = await Promise.all([
    prisma.projectTask.findMany({
      where: {
        projectId: { in: projectIds },
        status: { in: ["PENDIENTE", "EN_CURSO", "BLOQUEADA"] },
        dueAt: { lt: now },
      },
      take: 20,
      orderBy: { dueAt: "asc" },
    }),
    prisma.workExtra.findMany({
      where: { projectId: { in: projectIds }, status: "PENDIENTE_CLIENTE" },
      take: 15,
    }),
    prisma.technicalReport.findMany({
      where: { projectId: { in: projectIds }, status: "PENDIENTE_CLIENTE" },
      take: 15,
    }),
    prisma.incident.findMany({
      where: { projectId: { in: projectIds }, status: { not: "RESUELTA" } },
      take: 10,
    }),
    prisma.projectMilestone.findMany({
      where: {
        projectId: { in: projectIds },
        status: { in: ["PENDIENTE", "EN_CURSO", "ATRASADO"] },
        dueDate: { lt: now },
      },
      take: 15,
    }),
    prisma.projectMaterial.findMany({
      where: { projectId: { in: projectIds }, deliveryStatus: "PENDIENTE" },
      take: 15,
    }),
    prisma.workOrder.findMany({
      where: {
        projectId: { in: projectIds },
        status: { in: ["ASIGNADA", "EN_EJECUCION", "PENDIENTE_APROBACION"] },
        slaDueAt: { lt: now },
      },
      take: 10,
    }),
    prisma.qualityNonConformance.findMany({
      where: {
        projectId: { in: projectIds },
        status: { in: ["ABIERTA", "EN_TRATAMIENTO"] },
      },
      take: 10,
    }),
    prisma.worker.findMany({
      where: { projectId: { in: projectIds } },
      select: {
        id: true,
        name: true,
        projectId: true,
        artExpiry: true,
        lifeInsuranceExpiry: true,
        backgroundCheckStatus: true,
        eppComplete: true,
        artNumber: true,
        dni: true,
      },
    }),
    prisma.vehicle.findMany({
      where: { projectId: { in: projectIds } },
    }),
    prisma.project.findMany({
      where: {
        id: { in: projectIds },
        documents: { none: { category: "PLANOS" } },
        status: { in: ["PLANIFICACION", "EN_CURSO"] },
      },
      select: { id: true, name: true },
      take: 10,
    }),
  ]);

  for (const t of overdueTasks) {
    items.push({
      id: `task-${t.id}`,
      kind: "tarea_vencida",
      priority: t.priority === "URGENTE" ? "urgent" : "high",
      title: t.title,
      detail: projectMap.get(t.projectId),
      projectId: t.projectId,
      projectName: projectMap.get(t.projectId),
      link: `/dashboard/projects/${t.projectId}?tab=tasks`,
      dueAt: t.dueAt?.toISOString(),
    });
  }

  for (const e of pendingExtras) {
    items.push({
      id: `extra-${e.id}`,
      kind: "adicional",
      priority: "high",
      title: `Adicional: ${e.title}`,
      projectId: e.projectId,
      projectName: projectMap.get(e.projectId),
      link: `/dashboard/projects/${e.projectId}?tab=extras`,
    });
  }

  for (const r of pendingReports) {
    items.push({
      id: `report-${r.id}`,
      kind: "informe",
      priority: "high",
      title: r.title,
      projectId: r.projectId,
      projectName: projectMap.get(r.projectId),
      link: `/dashboard/projects/${r.projectId}?tab=reports`,
    });
  }

  for (const w of workers) {
    const { level, issues } = evaluateWorkerCompliance(w, {
      requireBackgroundCheck: projects.find((p) => p.id === w.projectId)?.siteType === "BARRIO_PRIVADO",
    });
    if (level !== "COMPLETO") {
      items.push({
        id: `worker-${w.id}`,
        kind: "legajo",
        priority: level === "VENCIDO" ? "urgent" : "normal",
        title: `Legajo: ${w.name}`,
        detail: issues.join("; "),
        projectId: w.projectId,
        projectName: projectMap.get(w.projectId),
        link: `/dashboard/projects/${w.projectId}?tab=workers`,
      });
    }
  }

  for (const v of vehicles) {
    const { level, issues } = evaluateVehicleCompliance(v);
    if (level !== "COMPLETO") {
      items.push({
        id: `vehicle-${v.id}`,
        kind: "vehiculo",
        priority: "normal",
        title: `Vehiculo: ${v.label}`,
        detail: issues.join("; "),
        projectId: v.projectId,
        projectName: projectMap.get(v.projectId),
        link: `/dashboard/projects/${v.projectId}?tab=vehicles`,
      });
    }
  }

  for (const m of pendingMaterials) {
    items.push({
      id: `mat-${m.id}`,
      kind: "material",
      priority: "normal",
      title: `Material pendiente: ${m.itemName}`,
      projectId: m.projectId,
      projectName: projectMap.get(m.projectId),
      link: `/dashboard/projects/${m.projectId}?tab=materials`,
    });
  }

  for (const nc of openNC) {
    items.push({
      id: `nc-${nc.id}`,
      kind: "calidad",
      priority: "high",
      title: `NC: ${nc.title}`,
      projectId: nc.projectId,
      projectName: projectMap.get(nc.projectId),
      link: `/dashboard/projects/${nc.projectId}?tab=quality`,
    });
  }

  for (const wo of overdueWorkOrders) {
    items.push({
      id: `wo-${wo.id}`,
      kind: "ot",
      priority: "high",
      title: `OT vencida: ${wo.title}`,
      projectId: wo.projectId,
      projectName: projectMap.get(wo.projectId),
      link: `/dashboard/projects/${wo.projectId}?tab=work-orders`,
      dueAt: wo.slaDueAt?.toISOString(),
    });
  }

  for (const i of openIncidents) {
    items.push({
      id: `inc-${i.id}`,
      kind: "incidencia",
      priority: "normal",
      title: i.title,
      projectId: i.projectId,
      projectName: projectMap.get(i.projectId),
      link: `/dashboard/projects/${i.projectId}?tab=incidents`,
    });
  }

  for (const ms of overdueMilestones) {
    items.push({
      id: `ms-${ms.id}`,
      kind: "hito",
      priority: "high",
      title: `Hito atrasado: ${ms.name}`,
      projectId: ms.projectId,
      projectName: projectMap.get(ms.projectId),
      link: `/dashboard/projects/${ms.projectId}?tab=tasks`,
      dueAt: ms.dueDate?.toISOString(),
    });
  }

  for (const p of projectsNoPlanos) {
    items.push({
      id: `noplan-${p.id}`,
      kind: "documentacion",
      priority: "normal",
      title: "Obra sin planos cargados",
      projectId: p.id,
      projectName: p.name,
      link: `/dashboard/projects/${p.id}?tab=documents`,
    });
  }

  for (const p of projects) {
    if (isExpired(p.liabilityInsuranceExpiry)) {
      items.push({
        id: `rc-${p.id}`,
        kind: "seguro",
        priority: "urgent",
        title: "Poliza RC vencida o proxima",
        projectId: p.id,
        projectName: p.name,
        link: `/dashboard/projects/${p.id}?tab=insurance`,
      });
    }
  }

  items.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const counts: Record<string, number> = {};
  for (const it of items) {
    counts[it.kind] = (counts[it.kind] ?? 0) + 1;
  }

  return { items: items.slice(0, 50), counts };
}
