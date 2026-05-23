export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
    }
    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error al iniciar sesion" }, { status: 500 });
  }
}
