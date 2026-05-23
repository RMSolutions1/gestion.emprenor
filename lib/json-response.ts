import { NextResponse } from "next/server";
import { serializeForJson } from "@/lib/serialize-json";

/** Respuesta JSON segura con Decimal/BigInt de Prisma */
export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(serializeForJson(data), init);
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
