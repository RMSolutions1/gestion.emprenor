export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { buildWorkQueue } from "@/lib/work-queue";

export async function GET() {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const queue = await buildWorkQueue(user!);
    return NextResponse.json(queue);
  } catch (err) {
    console.error("Work queue GET:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
