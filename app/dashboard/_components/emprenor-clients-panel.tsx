"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Landmark, Home, ArrowRight, ExternalLink } from "lucide-react";
import { EMPRENOR_BRAND, EMPRENOR_CLIENTS } from "@/lib/emprenor-clients";

const icons: Record<string, typeof Building2> = {
  cronec: Building2,
  "gob-salta": Landmark,
  "el-tipal": Home,
};

export function EmprenorClientsPanel() {
  return (
    <Card className="border-orange-100 bg-gradient-to-br from-orange-50/60 to-white dark:from-slate-900/40 dark:to-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <span className="text-blue-800">{EMPRENOR_BRAND.name}</span>
          <Badge variant="outline" className="text-[10px] font-normal">
            Proveedor
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Cartera activa — Salta y NOA. Cada cliente accede solo a sus obras en el portal.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {EMPRENOR_CLIENTS.map((c) => {
          const Icon = icons[c.id] ?? Building2;
          return (
            <div
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border bg-background/80"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-blue-800/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-blue-800" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{c.shortName}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.projectName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.sector}</p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link href={`/dashboard/projects/${c.projectId}`}>
                  Ver obra <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          );
        })}
        <a
          href="https://emprenor.com.ar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-800 hover:underline pt-1"
        >
          {EMPRENOR_BRAND.domain} <ExternalLink className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  );
}
