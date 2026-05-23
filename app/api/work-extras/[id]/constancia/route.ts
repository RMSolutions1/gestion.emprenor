export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-helpers";
import { buildConstanciaHtml } from "@/lib/work-extra-constancia";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const extra = await prisma.workExtra.findUnique({
      where: { id: params.id },
      include: {
        approvedBy: { select: { name: true, email: true } },
        project: {
          include: {
            assignments: { include: { user: { select: { id: true, role: true, name: true, email: true } } } },
            organization: { select: { name: true } },
          },
        },
      },
    });

    if (!extra) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const isAdmin = user!.role === "ADMIN";
    const isAssigned =
      extra.project.assignments.some((a) => a.userId === user!.id) || isAdmin;

    if (!isAssigned) {
      return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    if (extra.status !== "APROBADO" && extra.status !== "EN_EJECUCION" && extra.status !== "COMPLETADO") {
      return NextResponse.json(
        { error: "La constancia solo esta disponible tras la aprobacion del cliente" },
        { status: 400 }
      );
    }

    if (!extra.approvedAt || !extra.approvalReference) {
      return NextResponse.json({ error: "Faltan datos de aprobacion" }, { status: 400 });
    }

    const clientUser =
      extra.approvedBy ??
      extra.project.assignments.find((a) => a.user.role === "CLIENTE")?.user;

    const html = buildConstanciaHtml({
      reference: extra.approvalReference,
      projectName: extra.project.name,
      projectAddress: extra.project.address,
      organizationName: extra.project.organization?.name,
      title: extra.title,
      description: extra.description,
      amount: extra.amount.toString(),
      currency: extra.project.budgetCurrency ?? "ARS",
      clientName: clientUser?.name ?? "Cliente",
      clientEmail: clientUser?.email ?? "",
      approvedAt: extra.approvedAt,
      clientIp: extra.clientApprovalIp,
    });

    const format = new URL(req.url).searchParams.get("format");
    if (format === "json") {
      return NextResponse.json({
        reference: extra.approvalReference,
        approvedAt: extra.approvedAt,
        html,
      });
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="${extra.approvalReference}.html"`,
      },
    });
  } catch (err) {
    console.error("Constancia GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
