"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle2, Circle } from "lucide-react";
import { getRequirementsForSiteType } from "@/lib/site-requirements";
import { SITE_TYPE_LABELS } from "@/lib/roles";
import type { ProjectSiteCompliance } from "@/lib/project-site-compliance";

const categoryLabels: Record<string, string> = {
  personal: "Personal y legajo",
  vehiculo: "Transporte",
  materiales: "Materiales / herramientas",
  documentacion: "Documentacion",
  informes: "Informes tecnicos",
};

export function SiteRequirementsTab({
  project,
  projectId,
  workersCount,
  vehiclesCount,
  materialsCount,
  reportsCount,
  planosCount,
}: {
  project: { id?: string; siteType?: string; siteRequirementsNotes?: string | null };
  projectId: string;
  workersCount: number;
  vehiclesCount: number;
  materialsCount: number;
  reportsCount: number;
  planosCount: number;
}) {
  const siteType = project?.siteType ?? "OBRA_GENERAL";
  const items = getRequirementsForSiteType(siteType);
  const [compliance, setCompliance] = useState<ProjectSiteCompliance | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/compliance`)
      .then((r) => r.json())
      .then((d) => setCompliance(d?.error ? null : d))
      .catch(console.error);
  }, [projectId]);

  const checks: Record<string, boolean> = compliance?.checks ?? {
    dni: workersCount > 0,
    cuil_cuit: workersCount > 0,
    antecedentes: workersCount > 0,
    art: workersCount > 0,
    seguro_vida: workersCount > 0,
    epp: workersCount > 0,
    vehiculo_docs: vehiclesCount > 0,
    licencia: vehiclesCount > 0,
    lista_materiales: materialsCount > 0,
    planos: planosCount > 0,
    informe_conformidad: reportsCount > 0,
  };

  const grouped = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof items>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Requisitos del sitio — {SITE_TYPE_LABELS[siteType] ?? siteType}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Checklist para entregar documentacion digital al cliente (ej. administracion de barrio privado).
        </p>
        {compliance && (
          <p className="text-xs mt-2">
            Avance real del legajo:{" "}
            <strong>{compliance.completionPercent}%</strong>
            {compliance.complete ? " — listo para presentar" : ""}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {project?.siteRequirementsNotes && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm">
            <strong>Notas del cliente / consorcio:</strong> {project.siteRequirementsNotes}
          </div>
        )}

        {Object.entries(grouped).map(([category, reqs]) => (
          <div key={category}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {categoryLabels[category] ?? category}
            </p>
            <ul className="space-y-2">
              {reqs.map((req) => {
                const ok = checks[req.id];
                return (
                  <li
                    key={req.id}
                    className="flex items-start gap-2 p-2 rounded-lg border bg-muted/20"
                  >
                    {ok ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <span className="text-sm flex-1">{req.label}</span>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {ok ? "Cargado" : "Pendiente"}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
