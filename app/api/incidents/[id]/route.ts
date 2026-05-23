export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateIncidentSchema } from "@/lib/schemas";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
    const incident = await prisma.incident.findUnique({
      where: { id: params.id },
      include: { project: true },
    });

    if (!incident) {
      return NextResponse.json({ error: "Incidente no encontrado" }, { status: 404 });
    }

    return NextResponse.json(incident);
  } catch (error: any) {
    console.error("Incident GET error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    
    const body = await req.json();
    const validatedData = updateIncidentSchema.parse(body);
    
    const incident = await prisma.incident.update({
      where: { id: params.id },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.description !== undefined && { description: validatedData.description ?? null }),
        ...(validatedData.status && { status: validatedData.status }),
      },
    });
    return NextResponse.json(incident);
  } catch (error: any) {
    console.error("Incident PUT error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validación fallida", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar incidente" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    await prisma.incident.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Incident DELETE error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
