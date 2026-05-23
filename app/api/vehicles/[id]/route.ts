export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-helpers";
import { updateVehicleSchema } from "@/lib/schemas";
import { parseOptionalDate } from "@/lib/dates";
import { evaluateVehicleCompliance } from "@/lib/compliance";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const data = updateVehicleSchema.parse(body);

    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        ...(data.label !== undefined && { label: data.label }),
        ...(data.plate !== undefined && { plate: data.plate ?? null }),
        ...(data.driverName !== undefined && { driverName: data.driverName ?? null }),
        ...(data.driverLicense !== undefined && { driverLicense: data.driverLicense ?? null }),
        ...(data.driverLicenseExpiry !== undefined && {
          driverLicenseExpiry: parseOptionalDate(data.driverLicenseExpiry),
        }),
        ...(data.technicalReviewExpiry !== undefined && {
          technicalReviewExpiry: parseOptionalDate(data.technicalReviewExpiry),
        }),
        ...(data.insuranceExpiry !== undefined && {
          insuranceExpiry: parseOptionalDate(data.insuranceExpiry),
        }),
        ...(data.artExpiry !== undefined && {
          artExpiry: parseOptionalDate(data.artExpiry),
        }),
        ...(data.notes !== undefined && { notes: data.notes ?? null }),
      },
    });

    return NextResponse.json({
      ...vehicle,
      compliance: evaluateVehicleCompliance(vehicle),
    });
  } catch (err) {
    console.error("Vehicle PUT error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    await prisma.vehicle.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Vehicle DELETE error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
