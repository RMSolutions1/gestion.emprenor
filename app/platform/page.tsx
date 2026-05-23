import { redirect } from "next/navigation";
import { requirePlatformOwner } from "@/lib/platform-auth";
import { OwnerCommandCenter } from "./_components/owner-command-center";

export const dynamic = "force-dynamic";

export default async function PlatformPage() {
  const { authorized } = await requirePlatformOwner();
  if (!authorized) {
    redirect("/login?callbackUrl=/platform");
  }
  return <OwnerCommandCenter />;
}
