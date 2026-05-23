export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonOk } from "@/lib/json-response";
import { requireProjectAccess, requireStaff } from "@/lib/api-helpers";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireProjectAccess(params.id);
    if (error) return error;

    const milestones = await prisma.projectMilestone.findMany({
      where: { projectId: params.id },
      orderBy: [{ sortOrder: "asc" }, { dueDate: "asc" }],
    });
    return jsonOk(milestones);
  } catch (err) {
    console.error("Milestones GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireStaff();
    if (error) return error;
    const access = await requireProjectAccess(params.id);
    if (access.error) return access.error;

    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    const count = await prisma.projectMilestone.count({ where: { projectId: params.id } });
    const ms = await prisma.projectMilestone.create({
      data: {
        projectId: params.id,
        name: body.name.trim(),
        description: body.description ?? null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        percentComplete: body.percentComplete ?? 0,
        status: body.status ?? "PENDIENTE",
        sortOrder: count,
      },
    });
    return jsonOk(ms);
  } catch (err) {
    console.error("Milestones POST:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

    const ms = await prisma.projectMilestone.update({
      where: { id: body.id, projectId: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.percentComplete !== undefined && { percentComplete: body.percentComplete }),
        ...(body.status && { status: body.status }),
        ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      },
    });
    return jsonOk(ms);
  } catch (err) {
    console.error("Milestones PATCH:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
