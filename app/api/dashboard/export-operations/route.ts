export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-helpers";
import { orgFilter } from "@/lib/tenant-scope";
import { isPlatformOwner } from "@/lib/roles";

export async function GET() {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const tenant = orgFilter(user!);
    const where = isPlatformOwner(user!.role) ? {} : { organizationId: tenant.organizationId };

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: {
            workers: true,
            tasks: true,
            workExtras: true,
            documents: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const header = [
      "Obra",
      "Estado",
      "Tipo sitio",
      "Personal",
      "Tareas",
      "Adicionales",
      "Docs",
      "Direccion",
    ];
    const rows = projects.map((p) => [
      p.name,
      p.status,
      p.siteType,
      String(p._count.workers),
      String(p._count.tasks),
      String(p._count.workExtras),
      String(p._count.documents),
      p.address,
    ]);

    const csv = [
      "# Export operaciones Emprenor",
      header.join(";"),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="operaciones-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("Export operations:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
