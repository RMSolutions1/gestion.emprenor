"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AdminDashboardContent } from "./admin-dashboard-content";
import { ClientDashboardContent } from "./client-dashboard-content";
import { SpecialistDashboardContent } from "./specialist-dashboard-content";
import { isPlatformOwner, isSpecialist } from "@/lib/roles";

export function DashboardContent() {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const role = (session?.user as { role?: string })?.role ?? "CLIENTE";

  useEffect(() => {
    if (isPlatformOwner(role)) router.replace("/platform");
  }, [role, router]);

  if (isPlatformOwner(role)) return null;

  if (status === "loading") {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (role === "ADMIN") {
    return <AdminDashboardContent />;
  }

  if (isSpecialist(role)) {
    return <SpecialistDashboardContent />;
  }

  return <ClientDashboardContent />;
}
