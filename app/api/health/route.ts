export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";

export async function GET() {
  const started = Date.now();
  let db = false;
  let dbError: string | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
    db = true;
  } catch (e) {
    dbError = e instanceof Error ? e.message : "db_error";
  }

  const latencyMs = Date.now() - started;
  const healthy = db;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      version: process.env.npm_package_version ?? "1.0.0",
      timestamp: new Date().toISOString(),
      checks: {
        database: db ? "up" : "down",
        stripe: isStripeConfigured() ? "configured" : "mock",
        socket: "enabled",
      },
      latencyMs,
      error: dbError,
    },
    { status: healthy ? 200 : 503 }
  );
}
