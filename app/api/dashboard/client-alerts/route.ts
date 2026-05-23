export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { isCliente } from "@/lib/roles";
import { evaluateProjectSiteCompliance } from "@/lib/project-site-compliance";

const reportTypeLabels: Record<string, string> = {
  INFORME: "Informe tecnico",
  CONFORMIDAD: "Conformidad de obra",
  NO_CONFORMIDAD: "No conformidad",
  SOLICITUD_CORRECCION: "Solicitud de correccion",
  ACTA_INSPECCION: "Acta de inspeccion",
};

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;
    if (!isCliente(user!.role)) {
      return NextResponse.json({ error: "Solo clientes" }, { status: 403 });
    }

    const projectIdFilter = new URL(req.url).searchParams.get("projectId");

    const projects = await prisma.project.findMany({
      where: {
        assignments: { some: { userId: user!.id } },
        ...(projectIdFilter ? { id: projectIdFilter } : {}),
      },
      include: {
        workers: true,
        vehicles: true,
        materials: true,
        documents: { select: { category: true } },
        technicalReports: {
          include: { author: { select: { name: true, role: true } } },
        },
        workExtras: { where: { status: "PENDIENTE_CLIENTE" } },
      },
    });

    const pendingReports = projects.flatMap((p) =>
      p.technicalReports
        .filter((r) => r.status === "PENDIENTE_CLIENTE")
        .map((r) => ({
        id: r.id,
        title: r.title,
        reportType: r.reportType,
        reportTypeLabel: reportTypeLabels[r.reportType] ?? r.reportType,
        description: r.description,
        projectId: p.id,
        projectName: p.name,
        authorName: r.author?.name ?? "",
      }))
    );

    const pendingExtras = projects.flatMap((p) =>
      p.workExtras.map((e) => ({
        id: e.id,
        title: e.title,
        amount: Number(e.amount),
        description: e.description,
        projectId: p.id,
        projectName: p.name,
      }))
    );

    const siteAlerts = projects
      .filter((p) => p.siteType === "BARRIO_PRIVADO" || p.siteType === "INDUSTRIA")
      .map((p) => {
        const planosCount = p.documents.filter((d) => d.category === "PLANOS").length;
        const compliance = evaluateProjectSiteCompliance({
          siteType: p.siteType,
          workers: p.workers,
          vehicles: p.vehicles,
          materialsCount: p.materials.length,
          planosCount,
          reportsCount: p.technicalReports.filter((r) => r.status !== "BORRADOR").length,
        });
        return {
          projectId: p.id,
          projectName: p.name,
          siteType: p.siteType,
          completionPercent: compliance.completionPercent,
          complete: compliance.complete,
          missing: compliance.missing,
        };
      })
      .filter((a) => !a.complete);

    return NextResponse.json({
      pendingReports,
      pendingExtras,
      siteAlerts,
      totals: {
        pendingApprovals: pendingReports.length + pendingExtras.length,
        siteIssues: siteAlerts.length,
      },
    });
  } catch (err) {
    console.error("Client alerts error:", err);
    return NextResponse.json({ error: "Error al cargar alertas" }, { status: 500 });
  }
}
