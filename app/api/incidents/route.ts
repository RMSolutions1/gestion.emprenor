export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createIncidentSchema } from "@/lib/schemas";

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
    
    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({ 
        where: { projectId }, 
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.incident.count({ where: { projectId } }),
    ]);
    
    return NextResponse.json({
      data: incidents,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    console.error("Incidents GET error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    
    const body = await req.json();
    const validatedData = createIncidentSchema.parse(body);
    
    const incident = await prisma.incident.create({
      data: {
        title: validatedData.title,
        description: validatedData.description ?? null,
        status: validatedData.status,
        projectId: validatedData.projectId,
      },
    });
    return NextResponse.json(incident);
  } catch (error: any) {
    console.error("Incidents POST error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validación fallida", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear incidente" }, { status: 500 });
  }
}
