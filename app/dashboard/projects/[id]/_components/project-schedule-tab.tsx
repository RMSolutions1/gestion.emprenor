"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";

type Project = {
  name: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  workOrders?: {
    id: string;
    number: string;
    title: string;
    status: string;
    slaDueAt?: string | null;
  }[];
};

const statusColors: Record<string, string> = {
  BORRADOR: "bg-slate-200",
  ASIGNADA: "bg-blue-400",
  EN_EJECUCION: "bg-amber-400",
  PENDIENTE_APROBACION: "bg-purple-400",
  COMPLETADA: "bg-green-500",
  CANCELADA: "bg-red-400",
};

export function ProjectScheduleTab({ project }: { project: Project }) {
  const start = project.startDate ? new Date(project.startDate) : new Date();
  const end = project.endDate
    ? new Date(project.endDate)
    : new Date(start.getTime() + 90 * 86400000);
  const totalMs = Math.max(end.getTime() - start.getTime(), 1);
  const today = new Date();
  const todayPct = Math.min(
    100,
    Math.max(0, ((today.getTime() - start.getTime()) / totalMs) * 100)
  );

  const milestones = [
    { label: "Inicio obra", date: start },
    { label: "Hoy", date: today, highlight: true },
    { label: "Fin planificado", date: end },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-blue-600" />
          Cronograma / Gantt
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Vista temporal del proyecto y ordenes de trabajo vinculadas.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative h-8 rounded-full bg-muted overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-blue-600/30 rounded-full"
            style={{ width: `${todayPct}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-600 z-10"
            style={{ left: `${todayPct}%` }}
            title="Hoy"
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{start.toLocaleDateString("es-AR")}</span>
          <span>{end.toLocaleDateString("es-AR")}</span>
        </div>

        <ul className="space-y-2">
          {milestones.map((m) => (
            <li key={m.label} className="flex justify-between text-sm border-b pb-2">
              <span className={cn(m.highlight && "font-medium text-blue-700")}>{m.label}</span>
              <span>{m.date.toLocaleDateString("es-AR")}</span>
            </li>
          ))}
        </ul>

        <div>
          <p className="text-sm font-medium mb-3">Ordenes de trabajo en linea de tiempo</p>
          {!project.workOrders?.length ? (
            <p className="text-sm text-muted-foreground">Sin OT registradas.</p>
          ) : (
            <ul className="space-y-3">
              {project.workOrders.map((wo) => {
                const woEnd = wo.slaDueAt ? new Date(wo.slaDueAt) : end;
                const width = Math.min(
                  100,
                  Math.max(8, ((woEnd.getTime() - start.getTime()) / totalMs) * 100)
                );
                return (
                  <li key={wo.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">
                        {wo.number} — {wo.title}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {wo.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="h-6 rounded bg-muted relative overflow-hidden">
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded",
                          statusColors[wo.status] ?? "bg-slate-400"
                        )}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
