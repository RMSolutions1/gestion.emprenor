export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireProjectAccess, requireStaff } from "@/lib/api-helpers";
import { jsonOk } from "@/lib/json-response";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await requireProjectAccess(params.id);
    if (error) return error;

    const reports = await prisma.dailyFieldReport.findMany({
      where: { projectId: params.id },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { reportDate: "desc" },
      take: 60,
    });
    return jsonOk(reports);
  } catch (err) {
    console.error("Daily reports GET:", err);
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
    if (!body.summary?.trim()) {
      return NextResponse.json({ error: "Resumen requerido" }, { status: 400 });
    }

    const report = await prisma.dailyFieldReport.create({
      data: {
        projectId: params.id,
        reportDate: body.reportDate ? new Date(body.reportDate) : new Date(),
        weather: body.weather ?? null,
        crewCount: body.crewCount ?? null,
        summary: body.summary.trim(),
        blockers: body.blockers ?? null,
        nextSteps: body.nextSteps ?? null,
        authorId: user!.id,
      },
      include: { author: { select: { id: true, name: true } } },
    });
    return jsonOk(report);
  } catch (err) {
    console.error("Daily reports POST:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
