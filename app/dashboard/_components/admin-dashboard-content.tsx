"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/animate";
import {
  FolderKanban,
  HardHat,
  Truck,
  FileText,
  AlertTriangle,
  Users,
  DollarSign,
  ShieldAlert,
  Plus,
  Upload,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import {
  complianceBadgeClass,
  complianceLabel,
  type ComplianceLevel,
} from "@/lib/compliance";
import { ExpiryAlertsBanner } from "@/components/command/expiry-alerts-banner";
import { LiveFeedPanel } from "@/components/command/live-feed-panel";
import { EnterpriseSectorsPanel } from "./enterprise-sectors-panel";
import { EmprenorClientsPanel } from "./emprenor-clients-panel";
import { EMPRENOR_BRAND } from "@/lib/emprenor-clients";
import { ProductivityQueuePanel } from "./productivity-queue-panel";

type DashboardStats = {
  kpis: {
    totalProjects: number;
    activeProjects: number;
    planningProjects: number;
    totalWorkers: number;
    workersInCompliance: number;
    workersWithIssues: number;
    totalVehicles: number;
    vehiclesWithIssues: number;
    pendingExtras: number;
    pendingExtrasAmount: number;
    approvedExtrasAmount: number;
    totalClients: number;
    pendingIncidents: number;
    planosUploaded: number;
    projectsWithoutDocs: number;
    privateSiteProjects: number;
    pendingTechnicalReports: number;
    teamMembers: number;
  };
  workerAlerts: Array<{
    id: string;
    name: string;
    projectId: string;
    projectName: string;
    level: ComplianceLevel;
    issues: string[];
  }>;
  vehicleAlerts: Array<{
    id: string;
    label: string;
    projectId: string;
    projectName: string;
    level: ComplianceLevel;
    issues: string[];
  }>;
  pendingWorkExtras: Array<{
    id: string;
    title: string;
    amount: string | number;
    projectId: string;
    project: { name: string };
  }>;
  recentProjects: Array<{
    id: string;
    name: string;
    address: string;
    projectType: string;
    status: string;
    _count: { documents: number; workers: number; vehicles: number };
  }>;
};

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

function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.error) setStats(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const k = stats?.kpis;

  const kpiCards = [
    {
      label: "Obras activas",
      value: k?.activeProjects ?? 0,
      sub: `${k?.totalProjects ?? 0} proyectos en total`,
      icon: FolderKanban,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Personal en obra",
      value: k?.totalWorkers ?? 0,
      sub: `${k?.workersInCompliance ?? 0} legajos completos`,
      icon: HardHat,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Flota / transporte",
      value: k?.totalVehicles ?? 0,
      sub: `${k?.vehiclesWithIssues ?? 0} con documentacion pendiente`,
      icon: Truck,
      color: "text-teal-600 bg-teal-50",
    },
    {
      label: "Planos cargados",
      value: k?.planosUploaded ?? 0,
      sub: `${k?.projectsWithoutDocs ?? 0} obras sin documentacion`,
      icon: FileText,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Adicionales pendientes",
      value: k?.pendingExtras ?? 0,
      sub: formatMoney(k?.pendingExtrasAmount ?? 0),
      icon: DollarSign,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Clientes",
      value: k?.totalClients ?? 0,
      sub: "Cuentas con acceso al portal",
      icon: Users,
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Barrios / predios cerrados",
      value: k?.privateSiteProjects ?? 0,
      sub: "Obras con requisitos de acceso",
      icon: ShieldAlert,
      color: "text-rose-600 bg-rose-50",
    },
    {
      label: "Informes pend. cliente",
      value: k?.pendingTechnicalReports ?? 0,
      sub: `${k?.teamMembers ?? 0} especialistas en equipo`,
      icon: ClipboardList,
      color: "text-slate-600 bg-slate-50",
    },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            {EMPRENOR_BRAND.name} — Centro de operaciones
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Usted opera como proveedor: CRONEC SRL, Gobierno de Salta y Barrio Privado El Tipal
            ven sus obras, planos, legajo, cuenta corriente y recepcion con garantia 120 dias.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.03}>
        <div className="grid gap-4 lg:grid-cols-2">
          <EmprenorClientsPanel />
          <EnterpriseSectorsPanel />
        </div>
      </FadeIn>

      <FadeIn delay={0.04}>
        <ProductivityQueuePanel />
      </FadeIn>

      <ExpiryAlertsBanner />

      <FadeIn delay={0.05}>
        <Card className="border-blue-100 bg-gradient-to-r from-blue-50/80 to-white dark:from-slate-900/50 dark:to-card dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-800" />
              Flujo de trabajo del proveedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button asChild className="h-auto py-3 flex-col gap-1 bg-blue-800 hover:bg-blue-900">
                <Link href="/dashboard/projects">
                  <Plus className="h-4 w-4" />
                  <span className="text-xs">Nueva obra</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 flex-col gap-1">
                <Link href="/dashboard/projects">
                  <Upload className="h-4 w-4" />
                  <span className="text-xs">Subir planos</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 flex-col gap-1">
                <Link href="/dashboard/projects">
                  <HardHat className="h-4 w-4" />
                  <span className="text-xs">Cargar personal</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 flex-col gap-1">
                <Link href="/dashboard/administracion?tab=clientes">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Asignar cliente</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-3 flex-col gap-1">
                <Link href="/dashboard/administracion?tab=empleados">
                  <HardHat className="h-4 w-4" />
                  <span className="text-xs">Equipo tecnico</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <FadeIn key={stat.label} delay={i * 0.05}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-4">
                  <div className={`inline-flex p-2 rounded-lg mb-2 ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold font-mono">
                    {loading ? "-" : stat.value}
                  </p>
                  <p className="text-xs font-medium text-foreground">{stat.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.sub}</p>
                </CardContent>
              </Card>
            </FadeIn>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <FadeIn delay={0.15}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-600" />
                Legajo de personal — pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-24 bg-muted animate-pulse rounded-lg" />
              ) : (stats?.workerAlerts?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Todo el personal registrado tiene legajo completo
                </p>
              ) : (
                <ul className="space-y-2">
                  {stats?.workerAlerts?.map((w) => (
                    <li key={w.id}>
                      <Link
                        href={`/dashboard/projects/${w.projectId}?tab=workers`}
                        className="block p-3 rounded-lg border hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm">{w.name}</span>
                          <Badge
                            className={`text-[10px] ${complianceBadgeClass(w.level)}`}
                            variant="secondary"
                          >
                            {complianceLabel(w.level)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{w.projectName}</p>
                        <p className="text-[11px] text-red-600/80 mt-1 line-clamp-2">
                          {w.issues.slice(0, 2).join(" · ")}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Truck className="h-4 w-4 text-teal-700" />
                Transporte — documentacion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-24 bg-muted animate-pulse rounded-lg" />
              ) : (stats?.vehicleAlerts?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Vehiculos con documentacion al dia
                </p>
              ) : (
                <ul className="space-y-2">
                  {stats?.vehicleAlerts?.map((v) => (
                    <li key={v.id}>
                      <Link
                        href={`/dashboard/projects/${v.projectId}?tab=vehicles`}
                        className="block p-3 rounded-lg border hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm">{v.label}</span>
                          <Badge
                            className={`text-[10px] ${complianceBadgeClass(v.level)}`}
                            variant="secondary"
                          >
                            {complianceLabel(v.level)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{v.projectName}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.25}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-600" />
              Adicionales de obra — a confirmar por el cliente
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              Aprobados: {formatMoney(k?.approvedExtrasAmount ?? 0)}
            </span>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-16 bg-muted animate-pulse rounded-lg" />
            ) : (stats?.pendingWorkExtras?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay trabajos adicionales pendientes de aprobacion
              </p>
            ) : (
              <ul className="space-y-2">
                {stats?.pendingWorkExtras?.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/dashboard/projects/${item.projectId}?tab=extras`}
                      className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100 hover:bg-amber-50"
                    >
                      <div>
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.project.name}</p>
                      </div>
                      <span className="font-mono font-semibold text-amber-800">
                        {formatMoney(Number(item.amount))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.3}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-display">Obras recientes</CardTitle>
            <Link
              href="/dashboard/projects"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (stats?.recentProjects?.length ?? 0) === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Crea tu primera obra para comenzar
              </p>
            ) : (
              <div className="space-y-2">
                {stats?.recentProjects?.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-primary">
                        {project.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {project.address} · {project.projectType} · {project._count.workers}{" "}
                        trab. · {project._count.vehicles} veh.
                      </p>
                    </div>
                    <Badge
                      className={`ml-3 text-xs shrink-0 ${statusColors[project.status] ?? ""}`}
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

      {(k?.pendingIncidents ?? 0) > 0 && (
        <FadeIn>
          <Card className="border-red-100 bg-red-50/30">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-sm">
                <strong>{k?.pendingIncidents}</strong> incidencias abiertas requieren seguimiento.
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      <LiveFeedPanel compact title="Actividad reciente" />
    </div>
  );
}
