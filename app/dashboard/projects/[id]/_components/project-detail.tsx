"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, HardHat } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/ui/animate";
import { ProjectInfoTab } from "./project-info-tab";
import { DocumentsTab } from "./documents-tab";
import { IncidentsTab } from "./incidents-tab";
import { WorkersTab } from "./workers-tab";
import { VehiclesTab } from "./vehicles-tab";
import { WorkExtrasTab } from "./work-extras-tab";
import { AssignmentsTab } from "./assignments-tab";
import { SiteRequirementsTab } from "./site-requirements-tab";
import { MaterialsTab } from "./materials-tab";
import { TechnicalReportsTab } from "./technical-reports-tab";
import { ProjectChatPanel } from "@/components/chat/project-chat-panel";
import { WorkOrdersTab } from "./work-orders-tab";
import { QualityTab } from "./quality-tab";
import { HseTab } from "./hse-tab";
import { ProjectScheduleTab } from "./project-schedule-tab";
import { ProjectWorkspaceNav } from "./project-workspace-nav";
import { SITE_TYPE_LABELS, isAdmin, isCliente } from "@/lib/roles";
import { resolveInitialTab } from "@/lib/project-workspace-nav";
import { ClientInsuranceTab } from "./client-insurance-tab";
import { ClientProjectBanner } from "./client-project-banner";
import { ClientProviderMissionCard } from "@/components/platform/client-provider-mission";
import { ProjectMandantePanel } from "./project-mandante-panel";
import { ProjectReceptionTab } from "./project-reception-tab";
import { ProjectWarrantyBanner } from "./project-warranty-banner";
import { ProjectLedgerTab } from "./project-ledger-tab";
import { SiteLogTab } from "./site-log-tab";
import { ProjectTasksTab } from "./project-tasks-tab";
import { ProjectDailyTab } from "./project-daily-tab";

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

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { data: session } = useSession() || {};
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const role = (session?.user as { role?: string })?.role ?? "CLIENTE";
  const userId = (session?.user as { id?: string })?.id;

  const initialTab = useMemo(
    () => resolveInitialTab(role, tabFromUrl),
    [role, tabFromUrl]
  );

  const fetchProject = useCallback(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then((data: any) => setProject(data?.error ? null : data))
      .catch((e: any) => console.error(e))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
        <div className="h-40 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Proyecto no encontrado</p>
        <Link href="/dashboard/projects">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center gap-3 mb-1">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" /> Proyectos
            </Button>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold font-display tracking-tight">
                {project?.name ?? ""}
              </h1>
              <Badge
                className={`${statusColors?.[project?.status] ?? ""}`}
                variant="secondary"
              >
                {statusLabels?.[project?.status] ?? project?.status}
              </Badge>
              {project?.siteType && project.siteType !== "OBRA_GENERAL" && (
                <Badge variant="outline" className="text-xs">
                  {SITE_TYPE_LABELS[project.siteType] ?? project.siteType}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {project?.address ?? ""}
              </span>
              <span className="flex items-center gap-1">
                <HardHat className="h-3.5 w-3.5" /> {project?.projectType ?? ""}
              </span>
              {project?.startDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(project.startDate).toLocaleDateString("es-AR")}
                  {project?.endDate
                    ? ` - ${new Date(project.endDate).toLocaleDateString("es-AR")}`
                    : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </FadeIn>

      {isCliente(role) && (
        <>
          <FadeIn delay={0.07}>
            <ClientProviderMissionCard variant="project" projectId={projectId} />
          </FadeIn>
          <FadeIn delay={0.08}>
            <ClientProjectBanner projectId={projectId} />
          </FadeIn>
        </>
      )}

      <FadeIn delay={0.09}>
        <ProjectWarrantyBanner projectId={projectId} role={role} />
      </FadeIn>

      {isAdmin(role) && (
        <FadeIn delay={0.095}>
          <ProjectMandantePanel projectId={projectId} role={role} />
        </FadeIn>
      )}

      <FadeIn delay={0.1}>
        <ProjectWorkspaceNav role={role} initialTab={initialTab}>
          <TabsContent value="info">
            <ProjectInfoTab project={project} role={role} onUpdate={fetchProject} />
          </TabsContent>
          <TabsContent value="site">
            <SiteRequirementsTab
              project={project}
              projectId={projectId}
              workersCount={project?.workers?.length ?? project?._count?.workers ?? 0}
              vehiclesCount={project?.vehicles?.length ?? project?._count?.vehicles ?? 0}
              materialsCount={project?._count?.materials ?? 0}
              reportsCount={project?._count?.technicalReports ?? 0}
              planosCount={
                project?.documents?.filter?.((d: { category: string }) => d.category === "PLANOS")
                  ?.length ?? 0
              }
            />
          </TabsContent>
          <TabsContent value="documents">
            <DocumentsTab projectId={projectId} role={role} />
          </TabsContent>
          <TabsContent value="insurance">
            <ClientInsuranceTab
              projectId={projectId}
              project={project ?? {}}
              role={role}
              onUpdate={fetchProject}
            />
          </TabsContent>
          <TabsContent value="incidents">
            <IncidentsTab projectId={projectId} role={role} />
          </TabsContent>
          <TabsContent value="workers">
            <WorkersTab
              projectId={projectId}
              role={role}
              siteType={project?.siteType ?? "OBRA_GENERAL"}
            />
          </TabsContent>
          <TabsContent value="vehicles">
            <VehiclesTab projectId={projectId} role={role} />
          </TabsContent>
          <TabsContent value="materials">
            <MaterialsTab projectId={projectId} role={role} />
          </TabsContent>
          <TabsContent value="tasks">
            <ProjectTasksTab projectId={projectId} role={role} />
          </TabsContent>
          <TabsContent value="daily">
            <ProjectDailyTab projectId={projectId} role={role} />
          </TabsContent>
          <TabsContent value="chat">
            <ProjectChatPanel projectId={projectId} role={role} />
          </TabsContent>
          <TabsContent value="reports">
            <TechnicalReportsTab projectId={projectId} role={role} userId={userId} />
          </TabsContent>
          <TabsContent value="work-orders">
            <WorkOrdersTab projectId={projectId} role={role} />
          </TabsContent>
          <TabsContent value="quality">
            <QualityTab projectId={projectId} role={role} />
          </TabsContent>
          <TabsContent value="hse">
            <HseTab projectId={projectId} role={role} />
          </TabsContent>
          <TabsContent value="schedule">
            <ProjectScheduleTab project={project} />
          </TabsContent>
          <TabsContent value="extras">
            <WorkExtrasTab projectId={projectId} role={role} />
          </TabsContent>
          <TabsContent value="ledger">
            <ProjectLedgerTab projectId={projectId} role={role} />
          </TabsContent>
          <TabsContent value="site-log">
            <SiteLogTab projectId={projectId} role={role} />
          </TabsContent>
          <TabsContent value="reception">
            <ProjectReceptionTab projectId={projectId} role={role} onUpdate={fetchProject} />
          </TabsContent>
          {isAdmin(role) && (
            <TabsContent value="assignments">
              <AssignmentsTab project={project} onUpdate={fetchProject} />
            </TabsContent>
          )}
        </ProjectWorkspaceNav>
      </FadeIn>
    </div>
  );
}
