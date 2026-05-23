"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/animate";
import { FolderKanban, FileText, ClipboardCheck, ArrowRight, MapPin } from "lucide-react";
import { parseListResponse } from "@/lib/api-helpers";
import { roleLabel } from "@/lib/roles";

const statusLabels: Record<string, string> = {
  PLANIFICACION: "Planificacion",
  EN_CURSO: "En curso",
  PAUSADO: "Pausado",
  FINALIZADO: "Finalizado",
};

export function SpecialistDashboardContent() {
  const { data: session } = useSession() || {};
  const role = (session?.user as { role?: string })?.role;
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects?limit=20")
      .then((r) => r.json())
      .then((data) => setProjects(parseListResponse(data)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active = projects.filter((p) => p.status === "EN_CURSO").length;
  const privateSites = projects.filter((p) => p.siteType === "BARRIO_PRIVADO").length;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            Panel — {roleLabel(role)}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Obras asignadas, informes tecnicos y conformidades para el cliente
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FolderKanban className="h-8 w-8 text-blue-700" />
                <div>
                  <p className="text-2xl font-bold">{projects.length}</p>
                  <p className="text-xs text-muted-foreground">Obras asignadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-8 w-8 text-green-700" />
                <div>
                  <p className="text-2xl font-bold">{active}</p>
                  <p className="text-xs text-muted-foreground">En ejecucion</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold">{privateSites}</p>
                  <p className="text-xs text-muted-foreground">Barrios / predios cerrados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Mis obras</CardTitle>
            <Link href="/dashboard/projects">
              <Button variant="outline" size="sm">
                Ver todas <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aun no tenes obras asignadas. El administrador debe vincularte en Accesos del
                proyecto.
              </p>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 6).map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/projects/${p.id}?tab=reports`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {p.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {statusLabels[p.status] ?? p.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        Informes
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link href="/dashboard/projects">
            <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6 flex items-center gap-3">
                <FolderKanban className="h-6 w-6 text-blue-800" />
                <div>
                  <p className="font-medium text-sm">Gestionar obras</p>
                  <p className="text-xs text-muted-foreground">
                    Personal, materiales, documentacion e informes
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Card className="border-dashed">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Desde cada obra, pestaña <strong>Informes</strong>: cargar conformidades, no
              conformidades o solicitudes de correccion. Si requieren autorizacion del cliente,
              quedan en estado pendiente hasta su aprobacion.
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </div>
  );
}
