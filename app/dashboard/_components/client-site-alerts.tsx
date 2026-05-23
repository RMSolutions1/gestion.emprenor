"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, AlertTriangle, ArrowRight } from "lucide-react";
import { SITE_TYPE_LABELS } from "@/lib/roles";

export type SiteAlert = {
  projectId: string;
  projectName: string;
  siteType: string;
  completionPercent: number;
  complete: boolean;
  missing: Array<{ id: string; label: string; category: string }>;
};

export function ClientSiteAlerts({
  alerts,
  compact = false,
}: {
  alerts: SiteAlert[];
  compact?: boolean;
}) {
  if (alerts.length === 0) return null;

  return (
    <Card className="border-rose-200 bg-gradient-to-br from-rose-50/80 to-white">
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className="text-base font-display flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          Documentacion pendiente en predio
          <Badge variant="secondary" className="bg-rose-100 text-rose-800">
            {alerts.length}
          </Badge>
        </CardTitle>
        {!compact && (
          <p className="text-sm text-muted-foreground">
            Emprenor aun esta completando requisitos del barrio o sitio cerrado. Le avisamos
            cuando este todo listo para ingreso.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((a) => (
          <div key={a.projectId} className="p-3 rounded-lg border bg-white space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="h-4 w-4 text-rose-600 shrink-0" />
                <span className="font-medium text-sm truncate">{a.projectName}</span>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {SITE_TYPE_LABELS[a.siteType] ?? a.siteType}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {a.completionPercent}% completo
              </span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 pl-6 list-disc">
              {a.missing.slice(0, compact ? 3 : 6).map((m) => (
                <li key={m.id}>{m.label}</li>
              ))}
              {a.missing.length > (compact ? 3 : 6) && (
                <li>y {a.missing.length - (compact ? 3 : 6)} requisitos mas...</li>
              )}
            </ul>
            <Button size="sm" variant="outline" asChild className="w-full sm:w-auto">
              <Link href={`/dashboard/projects/${a.projectId}?tab=site`}>
                Ver requisitos <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
