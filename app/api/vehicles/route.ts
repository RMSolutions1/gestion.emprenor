export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertProjectAccess, requireAuth, requireAdmin } from "@/lib/api-helpers";
import { createVehicleSchema } from "@/lib/schemas";
import { parseOptionalDate } from "@/lib/dates";
import { evaluateVehicleCompliance } from "@/lib/compliance";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const projectId = new URL(req.url).searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId requerido" }, { status: 400 });
    }

    const allowed = await assertProjectAccess(user!.id, user!.role, projectId);
    if (!allowed) {
      return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { projectId },
      orderBy: { label: "asc" },
    });

    const data = vehicles.map((v) => ({
      ...v,
      compliance: evaluateVehicleCompliance(v),
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("Vehicles GET error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const data = createVehicleSchema.parse(body);

    const vehicle = await prisma.vehicle.create({
      data: {
        label: data.label,
        plate: data.plate ?? null,
        driverName: data.driverName ?? null,
        driverLicense: data.driverLicense ?? null,
        driverLicenseExpiry: parseOptionalDate(data.driverLicenseExpiry),
        technicalReviewExpiry: parseOptionalDate(data.technicalReviewExpiry),
        insuranceExpiry: parseOptionalDate(data.insuranceExpiry),
        artExpiry: parseOptionalDate(data.artExpiry),
        notes: data.notes ?? null,
        projectId: data.projectId,
      },
    });

    return NextResponse.json({
      ...vehicle,
      compliance: evaluateVehicleCompliance(vehicle),
    });
  } catch (err: unknown) {
    console.error("Vehicles POST error:", err);
    if (err && typeof err === "object" && "name" in err && err.name === "ZodError") {
      return NextResponse.json({ error: "Validacion fallida" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear vehiculo" }, { status: 500 });
  }
}
