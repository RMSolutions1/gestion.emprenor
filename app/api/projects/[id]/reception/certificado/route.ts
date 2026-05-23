export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { buildReceptionCertHtml } from "@/lib/project-reception-cert";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        assignments: true,
        receptionBy: { select: { name: true, email: true } },
        organization: { select: { name: true } },
      },
    });

    if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const isAdmin = user!.role === "ADMIN";
    const isAssigned = project.assignments.some((a) => a.userId === user!.id);
    if (!isAdmin && !isAssigned) {
      return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    if (!project.receptionAt || !project.receptionReference || !project.warrantyEndAt) {
      return NextResponse.json(
        { error: "Certificado disponible solo tras recepción confirmada" },
        { status: 400 }
      );
    }

    const html = buildReceptionCertHtml({
      reference: project.receptionReference,
      projectName: project.name,
      projectAddress: project.address,
      projectType: project.projectType,
      organizationName: project.organization?.name,
      clientName: project.receptionBy?.name ?? "Cliente",
      clientEmail: project.receptionBy?.email ?? "",
      receptionAt: project.receptionAt,
      warrantyDays: project.warrantyDays,
      warrantyEndAt: project.warrantyEndAt,
      clientIp: project.receptionClientIp,
      notes: project.receptionNotes,
    });

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${project.receptionReference}.html"`,
      },
    });
  } catch (err) {
    console.error("Certificado recepción:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
