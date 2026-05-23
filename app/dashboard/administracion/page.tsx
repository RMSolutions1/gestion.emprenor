import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSessionUser } from "@/lib/api-helpers";
import { isPlatformOwner } from "@/lib/roles";
import { getAdminDirectory } from "@/lib/data/directory";
import { AdminDirectory } from "./_components/admin-directory";

export const dynamic = "force-dynamic";

export default async function AdministracionPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/administracion");
  if (user.role !== "ADMIN" && !isPlatformOwner(user.role)) {
    redirect("/dashboard");
  }

  const snapshot = await getAdminDirectory(user);

  return (
    <Suspense fallback={<div className="h-40 bg-muted animate-pulse rounded-xl" />}>
      <AdminDirectory initial={snapshot} />
    </Suspense>
  );
}
