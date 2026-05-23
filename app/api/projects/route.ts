export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { createProjectSchema } from "@/lib/schemas";
import { orgFilter } from "@/lib/tenant-scope";
import { isPlatformOwner } from "@/lib/roles";
import { ensureProjectChannel } from "@/lib/chat-service";
import { serializeForJson } from "@/lib/serialize-json";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    let where: Record<string, unknown> = { ...orgFilter(user) };

    if (!isPlatformOwner(user.role) && user.role !== "ADMIN") {
      where = {
        ...orgFilter(user),
        assignments: { some: { userId: user.id } },
      };
    }
    
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
          _count: { select: { documents: true, incidents: true, workers: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);
    
    return NextResponse.json({
      data: serializeForJson(projects),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("Projects GET error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;
    if (!user!.organizationId && !isPlatformOwner(user!.role)) {
      return NextResponse.json({ error: "Usuario sin organizacion" }, { status: 400 });
    }

    const body = await req.json();
    
    // Validar con Zod
    const validatedData = createProjectSchema.parse(body);
    
    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        address: validatedData.address,
        projectType: validatedData.projectType,
        description: validatedData.description ?? null,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        status: validatedData.status,
        siteType: validatedData.siteType ?? "OBRA_GENERAL",
        siteRequirementsNotes: validatedData.siteRequirementsNotes ?? null,
        budgetAmount: validatedData.budgetAmount ?? null,
        budgetCurrency: validatedData.budgetCurrency ?? "ARS",
        organizationId: user!.organizationId ?? undefined,
      },
    });
    if (project.organizationId) {
      await ensureProjectChannel(project.id, project.organizationId);
    }
    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Projects POST error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validación fallida", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear proyecto" }, { status: 500 });
  }
}
