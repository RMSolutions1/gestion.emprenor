"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Save, X, Info } from "lucide-react";
import { toast } from "sonner";
import { SITE_TYPE_LABELS } from "@/lib/roles";
import { isAdmin } from "@/lib/roles";

const statusLabels: Record<string, string> = {
  PLANIFICACION: "Planificacion",
  EN_CURSO: "En Curso",
  PAUSADO: "Pausado",
  FINALIZADO: "Finalizado",
};
const projectTypes = ["Obra Civil", "Arquitectura", "Electrica", "Gas", "Refacciones", "Otro"];

function formatBudget(project: { budgetAmount?: unknown; budgetCurrency?: string }) {
  if (project?.budgetAmount == null) return "Sin definir";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: project?.budgetCurrency ?? "ARS",
  }).format(Number(project.budgetAmount));
}

export function ProjectInfoTab({
  project,
  role,
  onUpdate,
}: {
  project: any;
  role: string;
  onUpdate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: project?.name ?? "",
    address: project?.address ?? "",
    projectType: project?.projectType ?? "Obra Civil",
    description: project?.description ?? "",
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
    endDate: project?.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
    status: project?.status ?? "PLANIFICACION",
    budgetAmount: project?.budgetAmount != null ? String(project.budgetAmount) : "",
    budgetCurrency: project?.budgetCurrency ?? "ARS",
    siteType: project?.siteType ?? "OBRA_GENERAL",
    siteRequirementsNotes: project?.siteRequirementsNotes ?? "",
    liabilityInsurancePolicy: project?.liabilityInsurancePolicy ?? "",
    liabilityInsuranceInsurer: project?.liabilityInsuranceInsurer ?? "",
    liabilityInsuranceExpiry: project?.liabilityInsuranceExpiry
      ? new Date(project.liabilityInsuranceExpiry).toISOString().split("T")[0]
      : "",
  });

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/projects/${project?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budgetAmount: form.budgetAmount === "" ? null : parseFloat(form.budgetAmount),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Proyecto actualizado");
      setEditing(false);
      onUpdate?.();
    } catch (e) {
      console.error(e);
      toast.error("Error al actualizar");
    }
  };

  if (!editing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" /> Informacion del Proyecto
          </CardTitle>
          {isAdmin(role) && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-medium">{project?.name ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Direccion</p>
              <p className="font-medium">{project?.address ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo de Obra</p>
              <p className="font-medium">{project?.projectType ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado</p>
              <p className="font-medium">{statusLabels[project?.status] ?? project?.status}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha Inicio</p>
              <p className="font-medium">
                {project?.startDate ? new Date(project.startDate).toLocaleDateString("es-AR") : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha Fin</p>
              <p className="font-medium">
                {project?.endDate ? new Date(project.endDate).toLocaleDateString("es-AR") : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Presupuesto base</p>
              <p className="font-medium">{formatBudget(project)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo de sitio</p>
              <p className="font-medium">
                {SITE_TYPE_LABELS[project?.siteType ?? "OBRA_GENERAL"] ?? project?.siteType}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Poliza RC / terceros</p>
              <p className="font-medium text-sm">
                {project?.liiabilityInsuranceInsurer || "—"} ·{" "}
                {project?.liabilityInsurancePolicy || "sin n°"} · vence{" "}
                {project?.liabilityInsuranceExpiry
                  ? new Date(project.liabilityInsuranceExpiry).toLocaleDateString("es-AR")
                  : "—"}
              </p>
            </div>
            {project?.siteRequirementsNotes && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Requisitos del predio</p>
                <p className="font-medium text-sm">{project.siteRequirementsNotes}</p>
              </div>
            )}
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Descripcion</p>
              <p className="font-medium">{project?.description ?? "Sin descripcion"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-display">Editar Proyecto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Direccion</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={form.projectType} onValueChange={(v) => setForm({ ...form, projectType: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Fecha Inicio</Label>
            <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Fecha Fin</Label>
            <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Presupuesto base (ARS)</Label>
            <Input
              type="number"
              min="0"
              value={form.budgetAmount}
              onChange={(e) => setForm({ ...form, budgetAmount: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Aseguradora (RC terceros)</Label>
            <Input
              value={form.liabilityInsuranceInsurer}
              onChange={(e) => setForm({ ...form, liabilityInsuranceInsurer: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>N° poliza RC</Label>
            <Input
              value={form.liabilityInsurancePolicy}
              onChange={(e) => setForm({ ...form, liabilityInsurancePolicy: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Vencimiento poliza</Label>
            <Input
              type="date"
              value={form.liabilityInsuranceExpiry}
              onChange={(e) => setForm({ ...form, liabilityInsuranceExpiry: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Tipo de sitio / predio</Label>
            <Select value={form.siteType} onValueChange={(v) => setForm({ ...form, siteType: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SITE_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Requisitos del predio (barrio privado, industria, etc.)</Label>
          <Textarea
            value={form.siteRequirementsNotes}
            onChange={(e) => setForm({ ...form, siteRequirementsNotes: e.target.value })}
            rows={3}
            placeholder="Antecedentes, lista de materiales, horarios de ingreso..."
          />
        </div>
        <div className="space-y-2">
          <Label>Descripcion</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-blue-800 hover:bg-blue-900">
            <Save className="mr-1 h-4 w-4" /> Guardar
          </Button>
          <Button variant="outline" onClick={() => setEditing(false)}>
            <X className="mr-1 h-4 w-4" /> Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
