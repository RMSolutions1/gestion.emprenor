export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body ?? {};
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "El email ya esta registrado" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: "CLIENTE" },
    });
    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Error al crear cuenta" }, { status: 500 });
  }
}
