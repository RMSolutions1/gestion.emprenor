export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertProjectAccess, requireAuth } from "@/lib/api-helpers";

const categoryLabels: Record<string, string> = {
  HERRAMIENTA: "Herramienta",
  MATERIAL: "Material",
  EPP: "EPP",
  EQUIPO: "Equipo",
  OTRO: "Otro",
};

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const projectId = new URL(req.url).searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
    }

    const allowed = await assertProjectAccess(user!.id, user!.role, projectId);
    if (!allowed) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, address: true },
    });

    const materials = await prisma.projectMaterial.findMany({
      where: { projectId },
      orderBy: { itemName: "asc" },
    });

    const header = ["Item", "Cantidad", "Unidad", "Categoria", "Proveedor", "Marca", "Estado entrega"];
    const rows = materials.map((m) => [
      m.itemName,
      m.quantity ?? "",
      m.unit ?? "",
      categoryLabels[m.category] ?? m.category,
      m.supplier ?? "",
      m.brand ?? "",
      m.deliveryStatus,
    ]);

    const csv = [
      `# Lista de materiales - ${project?.name ?? projectId}`,
      `# ${project?.address ?? ""}`,
      header.join(";"),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="materiales-${projectId}.csv"`,
      },
    });
  } catch (err) {
    console.error("Materials export:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
