export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteFile } from "@/lib/s3";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    const doc = await prisma.document.findUnique({ where: { id: params.id } });
    if (!doc) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    try { await deleteFile(doc.cloudStoragePath); } catch (e: any) { console.error("S3 delete error:", e); }
    await prisma.document.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Document DELETE error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
