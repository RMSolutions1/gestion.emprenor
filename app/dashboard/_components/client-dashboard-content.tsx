"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, FileText, AlertTriangle, Bell, ArrowRight } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/ui/animate";
import { parseListResponse } from "@/lib/api-helpers";
import {
  ClientPendingActions,
  type PendingExtra,
  type PendingReport,
} from "./client-pending-actions";
import { ClientSiteAlerts, type SiteAlert } from "./client-site-alerts";
import { LiveFeedPanel } from "@/components/command/live-feed-panel";
import { ClientEmprenorWelcome } from "./client-emprenor-welcome";
import { ClientProviderMissionCard } from "@/components/platform/client-provider-mission";
import { ClientProfileCompleteBanner } from "./client-profile-complete-banner";

const statusLabels: Record<string, string> = {
  PLANIFICACION: "Planificacion",
  EN_CURSO: "En Curso",
  PAUSADO: "Pausado",
  FINALIZADO: "Finalizado",
};

const statusColors: Record<string, string> = {
  PLANIFICACION: "bg-blue-100 text-blue-800",
  EN_CURSO: "bg-green-100 text-green-800",
  PAUSADO: "bg-yellow-100 text-yellow-800",
  FINALIZADO: "bg-gray-100 text-gray-800",
};

export function ClientDashboardContent() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<{
    pendingReports: PendingReport[];
    pendingExtras: PendingExtra[];
    siteAlerts: SiteAlert[];
    totals: { pendingApprovals: number; siteIssues: number };
  } | null>(null);

  const loadAlerts = useCallback(() => {
    fetch("/api/dashboard/client-alerts")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setAlerts(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data: unknown) => setProjects(parseListResponse(data)))
      .catch(console.error)
      .finally(() => setLoading(false));
    loadAlerts();
  }, [loadAlerts]);

  const activeProjects = projects.filter((p) => p?.status === "EN_CURSO");
  const totalDocs = projects.reduce((acc, p) => acc + (p?._count?.documents ?? 0), 0);
  const pendingCount = alerts?.totals?.pendingApprovals ?? 0;
  const siteIssues = alerts?.totals?.siteIssues ?? 0;

  const stats = [
    {
      label: "Proyectos activos",
      value: activeProjects.length,
      icon: FolderKanban,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Por aprobar",
      value: pendingCount,
      icon: Bell,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Docs en obra",
      value: totalDocs,
      icon: FileText,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Predios incompletos",
      value: siteIssues,
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <ClientEmprenorWelcome />
      </FadeIn>
      <FadeIn delay={0.01}>
        <ClientProfileCompleteBanner />
      </FadeIn>
      <FadeIn delay={0.015}>
        <ClientProviderMissionCard variant="dashboard" />
      </FadeIn>
      <FadeIn delay={0.02}>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">Mis obras</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Cada proyecto es su vinculo con el proveedor: documentacion, personal asignado y consultas
            en un solo canal.
          </p>
        </div>
      </FadeIn>

      {alerts && (
        <FadeIn delay={0.05}>
          <ClientPendingActions
            reports={alerts.pendingReports}
            extras={alerts.pendingExtras}
            onAction={loadAlerts}
          />
          <div className="mt-4">
            <ClientSiteAlerts alerts={alerts.siteAlerts} />
          </div>
        </FadeIn>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <FadeIn key={stat.label} delay={i * 0.08}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold font-mono">{loading ? "-" : stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          );
        })}
      </div>

      <FadeIn delay={0.2}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-display">Mis proyectos</CardTitle>
            <Link
              href="/dashboard/projects"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No hay proyectos asignados
              </p>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {project.name ?? "Sin nombre"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {project.address ?? ""} · {project.projectType ?? ""}
                      </p>
                    </div>
                    <Badge
                      className={`ml-3 text-xs ${statusColors[project.status] ?? ""}`}
                      variant="secondary"
                    >
                      {statusLabels[project.status] ?? project.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <LiveFeedPanel compact title="Novedades de sus obras" />
    </div>
  );
}
