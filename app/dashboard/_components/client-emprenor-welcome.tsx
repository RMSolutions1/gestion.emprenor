"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clientByEmail, EMPRENOR_BRAND } from "@/lib/emprenor-clients";
import { Shield } from "lucide-react";
import { EmprenorLogo } from "@/components/brand/emprenor-logo";
import { PLATFORM_MISSION } from "@/lib/platform-positioning";

export function ClientEmprenorWelcome() {
  const { data: session } = useSession();
  const email = (session?.user as { email?: string })?.email ?? "";
  const name = (session?.user as { name?: string })?.name ?? "Cliente";
  const profile = clientByEmail(email);

  return (
    <Card className="border-emprenor/20 bg-gradient-to-r from-emprenor/5 to-white dark:from-slate-900/50 dark:to-card">
      <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <EmprenorLogo variant="icon" className="h-10 w-10 shrink-0 hidden sm:block" />
          <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Canal con su proveedor de servicios
          </p>
          <p className="font-display font-bold text-lg text-emprenor dark:text-emprenor-light">
            {EMPRENOR_BRAND.name}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Bienvenido, <strong>{profile?.shortName ?? name}</strong>
            {profile ? ` — ${profile.projectName}` : ""}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-lg">
            {PLATFORM_MISSION.subhead}
          </p>
          </div>
        </div>
        <Badge variant="secondary" className="self-start sm:self-center gap-1">
          <Shield className="h-3 w-3" />
          Portal seguro · garantia POL-GAR-001
        </Badge>
      </CardContent>
    </Card>
  );
}
