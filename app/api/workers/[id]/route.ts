export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateWorkerSchema } from "@/lib/schemas";
import { parseOptionalDate } from "@/lib/dates";
import { evaluateWorkerCompliance } from "@/lib/compliance";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
    const worker = await prisma.worker.findUnique({
      where: { id: params.id },
      include: { project: true },
    });

    if (!worker) {
      return NextResponse.json({ error: "Trabajador no encontrado" }, { status: 404 });
    }

    return NextResponse.json(worker);
  } catch (error: any) {
    console.error("Worker GET error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    
    const body = await req.json();
    const validatedData = updateWorkerSchema.parse(body);
    
    const worker = await prisma.worker.update({
      where: { id: params.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.workerRole && { workerRole: validatedData.workerRole }),
        ...(validatedData.certifications !== undefined && {
          certifications: validatedData.certifications ?? null,
        }),
        ...(validatedData.dni && { dni: validatedData.dni }),
        ...(validatedData.cuil !== undefined && { cuil: validatedData.cuil ?? null }),
        ...(validatedData.cuit !== undefined && { cuit: validatedData.cuit ?? null }),
        ...(validatedData.artNumber !== undefined && { artNumber: validatedData.artNumber ?? null }),
        ...(validatedData.backgroundCheckStatus !== undefined && {
          backgroundCheckStatus: validatedData.backgroundCheckStatus,
        }),
        ...(validatedData.backgroundCheckDate !== undefined && {
          backgroundCheckDate: parseOptionalDate(validatedData.backgroundCheckDate),
        }),
        ...(validatedData.backgroundCheckNotes !== undefined && {
          backgroundCheckNotes: validatedData.backgroundCheckNotes ?? null,
        }),
        ...(validatedData.artExpiry !== undefined && {
          artExpiry: parseOptionalDate(validatedData.artExpiry),
        }),
        ...(validatedData.lifeInsuranceExpiry !== undefined && {
          lifeInsuranceExpiry: parseOptionalDate(validatedData.lifeInsuranceExpiry),
        }),
        ...(validatedData.eppComplete !== undefined && { eppComplete: validatedData.eppComplete }),
        ...(validatedData.habilitationNotes !== undefined && {
          habilitationNotes: validatedData.habilitationNotes ?? null,
        }),
        ...(validatedData.complianceNotes !== undefined && {
          complianceNotes: validatedData.complianceNotes ?? null,
        }),
      },
    });
    return NextResponse.json({
      ...worker,
      compliance: evaluateWorkerCompliance(worker),
    });
  } catch (error: any) {
    console.error("Worker PUT error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validación fallida", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar trabajador" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    await prisma.worker.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Worker DELETE error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
