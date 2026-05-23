export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-helpers";
import { orgFilter } from "@/lib/tenant-scope";
import { isPlatformOwner } from "@/lib/roles";
import {
  evaluateWorkerCompliance,
  evaluateVehicleCompliance,
  type ComplianceLevel,
} from "@/lib/compliance";
import { serializeForJson } from "@/lib/serialize-json";

export async function GET() {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const tenant = orgFilter(user!);
    const projectWhere = isPlatformOwner(user!.role) ? {} : { organizationId: tenant.organizationId };
    const userWhere = isPlatformOwner(user!.role) ? {} : { organizationId: tenant.organizationId };

    const [
      projectCounts,
      recentProjects,
      workers,
      vehicles,
      workExtras,
      documents,
      clients,
      pendingIncidents,
      privateSiteProjects,
      pendingTechnicalReports,
      teamMembers,
    ] = await Promise.all([
      prisma.project.groupBy({ by: ["status"], where: projectWhere, _count: { status: true } }),
      prisma.project.findMany({
        where: projectWhere,
        include: {
          _count: {
            select: {
              documents: true,
              workers: true,
              vehicles: true,
              workExtras: true,
              incidents: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
      prisma.worker.findMany({
        where: { project: projectWhere },
        select: {
          id: true,
          name: true,
          projectId: true,
          dni: true,
          artNumber: true,
          artExpiry: true,
          lifeInsuranceExpiry: true,
          eppComplete: true,
          habilitationNotes: true,
          project: { select: { name: true } },
        },
      }),
      prisma.vehicle.findMany({
        where: { project: projectWhere },
        select: {
          id: true,
          label: true,
          plate: true,
          projectId: true,
          driverName: true,
          driverLicense: true,
          driverLicenseExpiry: true,
          technicalReviewExpiry: true,
          insuranceExpiry: true,
          artExpiry: true,
          project: { select: { name: true } },
        },
      }),
      prisma.workExtra.findMany({
        where: { status: "PENDIENTE_CLIENTE", project: projectWhere },
        include: { project: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.document.groupBy({
        by: ["category"],
        where: { project: projectWhere },
        _count: { category: true },
      }),
      prisma.user.count({ where: { ...userWhere, role: "CLIENTE" } }),
      prisma.incident.count({ where: { status: "PENDIENTE", project: projectWhere } }),
      prisma.project.count({ where: { ...projectWhere, siteType: "BARRIO_PRIVADO" } }),
      prisma.technicalReport.count({
        where: { status: "PENDIENTE_CLIENTE", project: projectWhere },
      }),
      prisma.user.count({
        where: {
          ...userWhere,
          role: {
            in: [
              "INGENIERO_CIVIL",
              "ARQUITECTO",
              "INGENIERO_ELECTRICO",
              "INSPECTOR_CALIDAD",
              "INSPECTOR_OBRA",
            ],
          },
        },
      }),
    ]);

    const totalProjects = projectCounts.reduce((acc, g) => acc + g._count.status, 0);
    const activeProjects =
      projectCounts.find((g) => g.status === "EN_CURSO")?._count.status ?? 0;
    const planningProjects =
      projectCounts.find((g) => g.status === "PLANIFICACION")?._count.status ?? 0;

    const workerAlerts = workers
      .map((w) => ({
        id: w.id,
        name: w.name,
        projectId: w.projectId,
        projectName: w.project.name,
        ...evaluateWorkerCompliance(w),
      }))
      .filter((w) => w.level !== "COMPLETO");

    const vehicleAlerts = vehicles
      .map((v) => ({
        id: v.id,
        label: v.label,
        plate: v.plate,
        projectId: v.projectId,
        projectName: v.project.name,
        ...evaluateVehicleCompliance(v),
      }))
      .filter((v) => v.level !== "COMPLETO");

    const projectsWithoutDocs = await prisma.project.count({
      where: { ...projectWhere, documents: { none: {} } },
    });

    const planosCount =
      documents.find((d) => d.category === "PLANOS")?._count.category ?? 0;

    const extrasPendingAmount = await prisma.workExtra.aggregate({
      where: { status: "PENDIENTE_CLIENTE", project: projectWhere },
      _sum: { amount: true },
    });

    const extrasApprovedAmount = await prisma.workExtra.aggregate({
      where: { status: "APROBADO", project: projectWhere },
      _sum: { amount: true },
    });

    const complianceSummary: Record<ComplianceLevel, number> = {
      COMPLETO: 0,
      INCOMPLETO: 0,
      VENCIDO: 0,
    };
    workers.forEach((w) => {
      const { level } = evaluateWorkerCompliance(w);
      complianceSummary[level]++;
    });

    return NextResponse.json(
      serializeForJson({
      kpis: {
        totalProjects,
        activeProjects,
        planningProjects,
        totalWorkers: workers.length,
        workersInCompliance: complianceSummary.COMPLETO,
        workersWithIssues: workerAlerts.length,
        totalVehicles: vehicles.length,
        vehiclesWithIssues: vehicleAlerts.length,
        pendingExtras: workExtras.length,
        pendingExtrasAmount: Number(extrasPendingAmount._sum.amount ?? 0),
        approvedExtrasAmount: Number(extrasApprovedAmount._sum.amount ?? 0),
        totalClients: clients,
        pendingIncidents,
        planosUploaded: planosCount,
        projectsWithoutDocs,
        privateSiteProjects,
        pendingTechnicalReports,
        teamMembers,
      },
      workerAlerts: workerAlerts.slice(0, 8),
      vehicleAlerts: vehicleAlerts.slice(0, 8),
      pendingWorkExtras: workExtras,
      recentProjects,
      documentsByCategory: documents.map((d) => ({
        category: d.category,
        count: d._count.category,
      })),
    })
    );
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ error: "Error al cargar estadisticas" }, { status: 500 });
  }
}
