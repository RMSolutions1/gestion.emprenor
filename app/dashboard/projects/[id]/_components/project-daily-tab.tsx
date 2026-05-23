"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { isAdmin, isSpecialist } from "@/lib/roles";

export function ProjectDailyTab({
  projectId,
  role,
}: {
  projectId: string;
  role: string;
}) {
  const canEdit = isAdmin(role) || isSpecialist(role);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    reportDate: new Date().toISOString().slice(0, 10),
    weather: "",
    crewCount: "",
    summary: "",
    blockers: "",
    nextSteps: "",
  });

  const load = useCallback(() => {
    fetch(`/api/projects/${projectId}/daily-reports`)
      .then((r) => r.json())
      .then((d) => setReports(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    if (!form.summary.trim()) {
      toast.error("Resumen del dia requerido");
      return;
    }
    const res = await fetch(`/api/projects/${projectId}/daily-reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        crewCount: form.crewCount ? Number(form.crewCount) : null,
      }),
    });
    if (!res.ok) {
      toast.error("Error");
      return;
    }
    toast.success("Parte diario guardado");
    setForm({
      reportDate: new Date().toISOString().slice(0, 10),
      weather: "",
      crewCount: "",
      summary: "",
      blockers: "",
      nextSteps: "",
    });
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Parte diario de obra
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Registro util para cliente y auditoria — una entrada por jornada.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit && (
          <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={form.reportDate}
                  onChange={(e) => setForm({ ...form, reportDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Clima</Label>
                <Input
                  value={form.weather}
                  onChange={(e) => setForm({ ...form, weather: e.target.value })}
                  placeholder="Soleado, lluvia..."
                />
              </div>
              <div className="space-y-2">
                <Label>Cuadrilla (personas)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.crewCount}
                  onChange={(e) => setForm({ ...form, crewCount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Que se hizo hoy *</Label>
              <Textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                rows={3}
                placeholder="Avance concreto, metros, pruebas, reuniones..."
              />
            </div>
            <div className="space-y-2">
              <Label>Bloqueos / riesgos</Label>
              <Textarea
                value={form.blockers}
                onChange={(e) => setForm({ ...form, blockers: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Manana / proximos pasos</Label>
              <Textarea
                value={form.nextSteps}
                onChange={(e) => setForm({ ...form, nextSteps: e.target.value })}
                rows={2}
              />
            </div>
            <Button onClick={submit} className="bg-blue-800 hover:bg-blue-900">
              <Plus className="mr-1 h-4 w-4" /> Guardar parte
            </Button>
          </div>
        )}
        {loading ? (
          <div className="h-12 bg-muted animate-pulse rounded" />
        ) : reports.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Sin partes cargados</p>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="p-3 border rounded-lg text-sm">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>
                    {new Date(r.reportDate).toLocaleDateString("es-AR")} — {r.author?.name}
                  </span>
                  {r.weather && <span>{r.weather}</span>}
                </div>
                <p className="whitespace-pre-wrap">{r.summary}</p>
                {r.blockers && (
                  <p className="text-xs text-amber-800 mt-2">
                    <strong>Bloqueos:</strong> {r.blockers}
                  </p>
                )}
                {r.nextSteps && (
                  <p className="text-xs text-blue-800 mt-1">
                    <strong>Proximo:</strong> {r.nextSteps}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
