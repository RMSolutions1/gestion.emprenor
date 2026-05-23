export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertProjectAccess, requireAuth } from "@/lib/api-helpers";
import { evaluateProjectSiteCompliance } from "@/lib/project-site-compliance";
import { isExpired } from "@/lib/compliance";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const projectId = params.id;
    const allowed = await assertProjectAccess(user!.id, user!.role, projectId);
    if (!allowed) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workers: true,
        vehicles: true,
        documents: { select: { category: true, projectMaterialId: true } },
        materials: {
          include: { _count: { select: { documents: true } } },
        },
        permitsToWork: { select: { status: true } },
        safetyInspections: { select: { id: true } },
        _count: { select: { technicalReports: true } },
      },
    });

    if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const planosCount = project.documents.filter((d) => d.category === "PLANOS").length;
    const materialsWithDocsCount = project.materials.filter((m) => m._count.documents > 0).length;
    const permitsApprovedCount = project.permitsToWork.filter((p) =>
      ["APROBADO", "EN_CURSO", "CERRADO"].includes(p.status)
    ).length;

    const hasLiabilityInsurance =
      !!project.liabilityInsurancePolicy?.trim() &&
      !!project.liabilityInsuranceInsurer?.trim() &&
      !isExpired(project.liabilityInsuranceExpiry);

    const compliance = evaluateProjectSiteCompliance({
      siteType: project.siteType,
      workers: project.workers,
      vehicles: project.vehicles,
      materialsCount: project.materials.length,
      planosCount,
      reportsCount: project._count.technicalReports,
      permitsApprovedCount,
      hasLiabilityInsurance,
      hseInspectionsCount: project.safetyInspections.length,
      materialsWithDocsCount,
    });

    return NextResponse.json(compliance);
  } catch (err) {
    console.error("Compliance GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
