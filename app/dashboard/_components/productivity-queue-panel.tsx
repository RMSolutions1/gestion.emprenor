"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListTodo, Download, RefreshCw } from "lucide-react";
import type { WorkQueueItem } from "@/lib/work-queue";

const priorityStyle: Record<string, string> = {
  urgent: "bg-red-100 text-red-900 border-red-200",
  high: "bg-amber-100 text-amber-900 border-amber-200",
  normal: "bg-slate-100 text-slate-800",
};

const kindLabels: Record<string, string> = {
  tarea_vencida: "Tarea vencida",
  adicional: "Adicional",
  informe: "Informe",
  legajo: "Legajo",
  vehiculo: "Vehiculo",
  material: "Material",
  calidad: "Calidad",
  ot: "OT",
  incidencia: "Incidencia",
  hito: "Hito",
  documentacion: "Docs",
  seguro: "Seguro",
};

export function ProductivityQueuePanel() {
  const [items, setItems] = useState<WorkQueueItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/dashboard/work-queue")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setCounts(d.counts ?? {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Card className="border-2 border-amber-200/80">
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-amber-700" />
            Cola de trabajo — hacer hoy
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Pendientes reales de la BD: vencimientos, aprobaciones, legajo, materiales y OT.
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href="/api/dashboard/export-operations" download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(counts).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {Object.entries(counts).map(([k, n]) => (
              <Badge key={k} variant="outline" className="text-[10px]">
                {kindLabels[k] ?? k}: {n}
              </Badge>
            ))}
          </div>
        )}
        {loading ? (
          <div className="h-24 bg-muted animate-pulse rounded" />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Sin pendientes criticos. Buen estado operativo.
          </p>
        ) : (
          <div className="max-h-[320px] overflow-y-auto border rounded-lg divide-y">
            {items.map((it) => (
              <Link
                key={it.id}
                href={it.link}
                className="flex items-start justify-between gap-2 p-2.5 hover:bg-muted/50 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{it.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {it.projectName ?? "—"}
                    {it.detail ? ` · ${it.detail}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge className={`text-[9px] ${priorityStyle[it.priority]}`}>
                    {it.priority === "urgent" ? "URGENTE" : it.priority === "high" ? "ALTA" : "NORMAL"}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground">
                    {kindLabels[it.kind] ?? it.kind}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
