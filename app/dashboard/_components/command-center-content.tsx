"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LiveFeedPanel } from "@/components/command/live-feed-panel";
import { ExpiryAlertsBanner } from "@/components/command/expiry-alerts-banner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/animate";
import { FolderKanban, Users, AlertTriangle, FileCheck, ArrowRight } from "lucide-react";

export function CommandCenterContent() {
  const [stats, setStats] = useState<{
    activeProjects?: number;
    totalProjects?: number;
    pendingExtras?: number;
    pendingTechnicalReports?: number;
    workersWithIssues?: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setStats(data.kpis);
      })
      .catch(console.error);
  }, []);

  const kpis = [
    { label: "Obras activas", value: stats?.activeProjects ?? "—", icon: FolderKanban },
    {
      label: "Informes pend. cliente",
      value: stats?.pendingTechnicalReports ?? "—",
      icon: FileCheck,
    },
    { label: "Adicionales pendientes", value: stats?.pendingExtras ?? "—", icon: AlertTriangle },
    { label: "Legajos con alertas", value: stats?.workersWithIssues ?? "—", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight">
              Centro de comando operativo
            </h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
              Monitoreo en tiempo real de obras, aprobaciones y documentacion para clientes
              corporativos.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/projects">
              Ver obras <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </FadeIn>

      <ExpiryAlertsBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <FadeIn key={k.label} delay={i * 0.05}>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className="h-8 w-8 text-orange-500 opacity-90" />
                  <div>
                    <p className="text-2xl font-bold font-mono">{k.value}</p>
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          );
        })}
      </div>

      <LiveFeedPanel title="Feed operativo en vivo" />
    </div>
  );
}
