export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireProjectAccess, requireStaff } from "@/lib/api-helpers";
import { jsonOk } from "@/lib/json-response";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireProjectAccess(params.id);
    if (error) return error;

    const tasks = await prisma.projectTask.findMany({
      where: { projectId: params.id },
      include: {
        assignee: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: "desc" }, { dueAt: "asc" }, { createdAt: "desc" }],
    });
    return jsonOk(tasks);
  } catch (err) {
    console.error("Tasks GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await requireStaff();
    if (error) return error;

    const access = await requireProjectAccess(params.id);
    if (access.error) return access.error;

    const body = await req.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Titulo requerido" }, { status: 400 });
    }

    const task = await prisma.projectTask.create({
      data: {
        projectId: params.id,
        title: body.title.trim(),
        description: body.description ?? null,
        priority: body.priority ?? "MEDIA",
        status: "PENDIENTE",
        dueAt: body.dueAt ? new Date(body.dueAt) : null,
        assigneeId: body.assigneeId ?? null,
        createdById: user!.id,
      },
      include: { assignee: { select: { id: true, name: true } } },
    });
    return jsonOk(task);
  } catch (err) {
    console.error("Tasks POST:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
