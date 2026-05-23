export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getFileUrl } from "@/lib/s3";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    const doc = await prisma.document.findUnique({ where: { id }, include: { project: true } });
    if (!doc) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    const user = session.user as any;
    if (user.role !== "ADMIN") {
      const hasAccess = await prisma.projectAssignment.findFirst({
        where: { userId: user.id, projectId: doc.projectId },
      });
      if (!hasAccess) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }
    const url = await getFileUrl(doc.cloudStoragePath, doc.isPublic);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Document download error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
