export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertProjectAccess, requireAdmin, requireAuth } from "@/lib/api-helpers";
import { buildProjectLedgerStatement } from "@/lib/project-ledger";
import { createLedgerEntrySchema } from "@/lib/schemas";
import { jsonOk } from "@/lib/json-response";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const projectId = params.id;
    const allowed = await assertProjectAccess(user!.id, user!.role, projectId);
    if (!allowed) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        budgetAmount: true,
        budgetCurrency: true,
        workExtras: {
          where: { status: { in: ["APROBADO", "EN_EJECUCION", "COMPLETADO"] } },
        },
        ledgerEntries: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const statement = buildProjectLedgerStatement({
      budgetAmount: project.budgetAmount,
      budgetCurrency: project.budgetCurrency,
      workExtras: project.workExtras,
      entries: project.ledgerEntries,
    });

    return jsonOk({
      entries: project.ledgerEntries,
      ...statement,
    });
  } catch (err) {
    console.error("Ledger GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const body = createLedgerEntrySchema.parse(await req.json());
    if (body.projectId !== params.id) {
      return NextResponse.json({ error: "projectId inconsistente" }, { status: 400 });
    }

    const allowed = await assertProjectAccess(user!.id, user!.role, params.id);
    if (!allowed) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });

    const entry = await prisma.projectLedgerEntry.create({
      data: {
        projectId: params.id,
        type: body.type,
        amount: body.amount,
        currency: body.currency,
        description: body.description,
        reference: body.reference ?? null,
        createdById: user!.id,
      },
    });

    return jsonOk(entry);
  } catch (err) {
    console.error("Ledger POST:", err);
    return NextResponse.json({ error: "Error al registrar movimiento" }, { status: 500 });
  }
}
