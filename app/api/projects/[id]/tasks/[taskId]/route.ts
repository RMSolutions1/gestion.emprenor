export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  try {
    const { error } = await requireStaff();
    if (error) return error;

    const body = await req.json();
    const task = await prisma.projectTask.update({
      where: { id: params.taskId, projectId: params.id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status && { status: body.status }),
        ...(body.priority && { priority: body.priority }),
        ...(body.dueAt !== undefined && { dueAt: body.dueAt ? new Date(body.dueAt) : null }),
        ...(body.assigneeId !== undefined && { assigneeId: body.assigneeId }),
        ...(body.status === "HECHA" && { completedAt: new Date() }),
        ...(body.status && body.status !== "HECHA" && { completedAt: null }),
      },
    });
    return NextResponse.json(task);
  } catch (err) {
    console.error("Task PATCH:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; taskId: string } }) {
  try {
    const { error } = await requireStaff();
    if (error) return error;
    await prisma.projectTask.delete({ where: { id: params.taskId, projectId: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Task DELETE:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
