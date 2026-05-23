export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    const { userId, projectId } = await req.json();
    if (!userId || !projectId) return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });
    const assignment = await prisma.projectAssignment.create({ data: { userId, projectId } });
    return NextResponse.json(assignment);
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "Ya asignado" }, { status: 400 });
    console.error("Assignment POST error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    await prisma.projectAssignment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Assignment DELETE error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
