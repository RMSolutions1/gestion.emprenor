import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isPlatformOwner } from "@/lib/roles";
import { MarketingSite } from "@/components/marketing/marketing-site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (session && isPlatformOwner(role)) {
    redirect("/platform");
  }
  if (session) {
    redirect("/dashboard");
  }

  return <MarketingSite />;
}
