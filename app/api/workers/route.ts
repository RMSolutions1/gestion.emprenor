export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createWorkerSchema } from "@/lib/schemas";
import { parseOptionalDate } from "@/lib/dates";
import { evaluateWorkerCompliance } from "@/lib/compliance";
import { publishOperationalEvent, recordAudit } from "@/lib/operational-events";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;
    
    if (!projectId) return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
    
    const user = session.user as any;
    if (user.role !== "ADMIN") {
      const hasAccess = await prisma.projectAssignment.findFirst({ where: { userId: user.id, projectId } });
      if (!hasAccess) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { siteType: true },
    });
    const requireBg = project?.siteType === "BARRIO_PRIVADO";

    const workers = await prisma.worker.findMany({
      where: { projectId },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    });
    const total = await prisma.worker.count({ where: { projectId } });

    const data = workers.map((w) => ({
      ...w,
      compliance: evaluateWorkerCompliance(w, { requireBackgroundCheck: requireBg }),
    }));

    return NextResponse.json({
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("Workers GET error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    
    const body = await req.json();
    const validatedData = createWorkerSchema.parse(body);
    
    const user = session.user as { id: string };
    const worker = await prisma.worker.create({
      data: {
        name: validatedData.name,
        workerRole: validatedData.workerRole ?? "",
        certifications: validatedData.certifications ?? null,
        dni: validatedData.dni,
        cuil: validatedData.cuil ?? null,
        cuit: validatedData.cuit ?? null,
        artNumber: validatedData.artNumber ?? null,
        artExpiry: parseOptionalDate(validatedData.artExpiry),
        lifeInsuranceExpiry: parseOptionalDate(validatedData.lifeInsuranceExpiry),
        eppComplete: validatedData.eppComplete ?? false,
        backgroundCheckStatus: validatedData.backgroundCheckStatus ?? "NO_APLICA",
        backgroundCheckDate: parseOptionalDate(validatedData.backgroundCheckDate),
        backgroundCheckNotes: validatedData.backgroundCheckNotes ?? null,
        habilitationNotes: validatedData.habilitationNotes ?? null,
        complianceNotes: validatedData.complianceNotes ?? null,
        projectId: validatedData.projectId,
      },
    });

    await recordAudit({
      actorId: user.id,
      action: "WORKER_CREATE",
      resource: "worker",
      resourceId: worker.id,
      metadata: { projectId: worker.projectId, name: worker.name },
    });

    await publishOperationalEvent({
      projectId: worker.projectId,
      type: "WORKER_ADDED",
      title: `Personal registrado: ${worker.name}`,
      body: worker.workerRole,
      actorId: user.id,
      notifyRoles: ["CLIENTE"],
      notificationType: "SYSTEM",
      link: `/dashboard/projects/${worker.projectId}?tab=workers`,
    });

    return NextResponse.json({
      ...worker,
      compliance: evaluateWorkerCompliance(worker),
    });
  } catch (error: any) {
    console.error("Workers POST error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validación fallida", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear trabajador" }, { status: 500 });
  }
}
