export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/roles";
import { parseOptionalDate } from "@/lib/dates";
import { jsonOk, jsonError } from "@/lib/json-response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const user = session.user as any;
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        assignments: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
        documents: { orderBy: { uploadedAt: "desc" } },
        incidents: { orderBy: { createdAt: "desc" } },
        workers: { orderBy: { name: "asc" } },
        vehicles: { orderBy: { label: "asc" } },
        workOrders: {
          orderBy: { createdAt: "asc" },
          select: { id: true, number: true, title: true, status: true, slaDueAt: true },
        },
        _count: {
          select: {
            documents: true,
            materials: true,
            technicalReports: true,
            workers: true,
            vehicles: true,
          },
        },
      },
    });
    if (!project) return jsonError("Proyecto no encontrado", 404);
    if (!isAdmin(user.role)) {
      const hasAccess = project.assignments?.some((a: any) => a?.userId === user.id);
      if (!hasAccess) return jsonError("Sin acceso", 403);
    }
    return jsonOk(project);
  } catch (error: any) {
    console.error("Project GET error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    const body = await req.json();
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        name: body.name,
        address: body.address,
        projectType: body.projectType,
        description: body.description ?? null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status,
        ...(body.siteType && { siteType: body.siteType }),
        ...(body.siteRequirementsNotes !== undefined && {
          siteRequirementsNotes: body.siteRequirementsNotes ?? null,
        }),
        ...(body.budgetAmount !== undefined && {
          budgetAmount: body.budgetAmount === "" || body.budgetAmount == null ? null : body.budgetAmount,
        }),
        ...(body.budgetCurrency && { budgetCurrency: body.budgetCurrency }),
        ...(body.liabilityInsurancePolicy !== undefined && {
          liabilityInsurancePolicy: body.liabilityInsurancePolicy ?? null,
        }),
        ...(body.liabilityInsuranceInsurer !== undefined && {
          liabilityInsuranceInsurer: body.liabilityInsuranceInsurer ?? null,
        }),
        ...(body.liabilityInsuranceExpiry !== undefined && {
          liabilityInsuranceExpiry: parseOptionalDate(body.liabilityInsuranceExpiry),
        }),
      },
    });
    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Project PUT error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Project DELETE error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
