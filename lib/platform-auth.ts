import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isPlatformOwner } from "@/lib/roles";

export async function requirePlatformOwner() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || !isPlatformOwner(role)) {
    return { authorized: false as const, session: null };
  }
  return { authorized: true as const, session };
}
