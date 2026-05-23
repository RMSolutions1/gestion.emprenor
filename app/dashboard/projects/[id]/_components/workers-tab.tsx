"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HardHat, Plus, Pencil, Trash2, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { parseListResponse } from "@/lib/api-helpers";
import { complianceBadgeClass, complianceLabel, type ComplianceLevel } from "@/lib/compliance";
import { isAdmin, isCliente } from "@/lib/roles";

const BG_LABELS: Record<string, string> = {
  NO_APLICA: "No aplica",
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
};

const emptyForm = {
  name: "",
  workerRole: "",
  certifications: "",
  dni: "",
  cuil: "",
  cuit: "",
  artNumber: "",
  artExpiry: "",
  lifeInsuranceExpiry: "",
  eppComplete: false,
  backgroundCheckStatus: "NO_APLICA",
  backgroundCheckDate: "",
  backgroundCheckNotes: "",
  habilitationNotes: "",
  complianceNotes: "",
};

export function WorkersTab({
  projectId,
  role,
  siteType = "OBRA_GENERAL",
}: {
  projectId: string;
  role: string;
  siteType?: string;
}) {
  const requireBg = siteType === "BARRIO_PRIVADO";
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchWorkers = useCallback(() => {
    setLoading(true);
    fetch(`/api/workers?projectId=${projectId}&limit=50`)
      .then((r) => r.json())
      .then((data) => setWorkers(parseListResponse(data)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleSave = async () => {
    if (!form.name) {
      toast.error("El nombre es requerido");
      return;
    }
    if (!form.dni) {
      toast.error("El DNI es requerido para el legajo");
      return;
    }
    try {
      const url = editingId ? `/api/workers/${editingId}` : "/api/workers";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? form : { ...form, projectId };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Personal actualizado" : "Personal registrado");
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchWorkers();
    } catch {
      toast.error("Error al guardar");
    }
  };

  const openEdit = (w: any) => {
    setEditingId(w.id);
    setForm({
      name: w.name ?? "",
      workerRole: w.workerRole ?? "",
      certifications: w.certifications ?? "",
      dni: w.dni ?? "",
      cuil: w.cuil ?? "",
      cuit: w.cuit ?? "",
      artNumber: w.artNumber ?? "",
      artExpiry: w.artExpiry ? new Date(w.artExpiry).toISOString().split("T")[0] : "",
      lifeInsuranceExpiry: w.lifeInsuranceExpiry
        ? new Date(w.lifeInsuranceExpiry).toISOString().split("T")[0]
        : "",
      eppComplete: w.eppComplete ?? false,
      backgroundCheckStatus: w.backgroundCheckStatus ?? "NO_APLICA",
      backgroundCheckDate: w.backgroundCheckDate
        ? new Date(w.backgroundCheckDate).toISOString().split("T")[0]
        : "",
      backgroundCheckNotes: w.backgroundCheckNotes ?? "",
      habilitationNotes: w.habilitationNotes ?? "",
      complianceNotes: w.complianceNotes ?? "",
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      backgroundCheckStatus: requireBg ? "PENDIENTE" : "NO_APLICA",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este registro de personal?")) return;
    try {
      await fetch(`/api/workers/${id}`, { method: "DELETE" });
      toast.success("Eliminado");
      fetchWorkers();
    } catch {
      toast.error("Error");
    }
  };

  const FormFields = () => (
    <div className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto pr-1">
      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
        Datos visibles para el cliente: confirma ART, seguro de vida, EPP y habilitaciones antes de ingresar a obra.
      </p>
      {requireBg && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded">
          Barrio privado: se exigen antecedentes penales aprobados para cada operario.
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2 sm:col-span-2">
          <Label>Nombre completo *</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Puesto / rol</Label>
          <Input
            value={form.workerRole}
            onChange={(e) => setForm({ ...form, workerRole: e.target.value })}
            placeholder="Electricista, oficial, etc."
          />
        </div>
        <div className="space-y-2">
          <Label>DNI *</Label>
          <Input value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>CUIL</Label>
          <Input value={form.cuil} onChange={(e) => setForm({ ...form, cuil: e.target.value })} placeholder="20-12345678-9" />
        </div>
        <div className="space-y-2">
          <Label>CUIT (si corresponde)</Label>
          <Input value={form.cuit} onChange={(e) => setForm({ ...form, cuit: e.target.value })} />
        </div>
        {requireBg && (
          <>
            <div className="space-y-2">
              <Label>Estado antecedentes</Label>
              <Select
                value={form.backgroundCheckStatus}
                onValueChange={(v) => setForm({ ...form, backgroundCheckStatus: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BG_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha antecedentes</Label>
              <Input
                type="date"
                value={form.backgroundCheckDate}
                onChange={(e) => setForm({ ...form, backgroundCheckDate: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Notas antecedentes</Label>
              <Textarea
                value={form.backgroundCheckNotes}
                onChange={(e) => setForm({ ...form, backgroundCheckNotes: e.target.value })}
                rows={2}
              />
            </div>
          </>
        )}
        <div className="space-y-2">
          <Label>N° ART</Label>
          <Input value={form.artNumber} onChange={(e) => setForm({ ...form, artNumber: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Vencimiento ART</Label>
          <Input
            type="date"
            value={form.artExpiry}
            onChange={(e) => setForm({ ...form, artExpiry: e.target.value })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Vencimiento seguro de vida</Label>
          <Input
            type="date"
            value={form.lifeInsuranceExpiry}
            onChange={(e) => setForm({ ...form, lifeInsuranceExpiry: e.target.value })}
          />
        </div>
        <div className="flex items-center justify-between sm:col-span-2 border rounded-lg p-3">
          <Label className="cursor-pointer">EPP entregado (casco, botas, arnes, etc.)</Label>
          <Switch checked={form.eppComplete} onCheckedChange={(v) => setForm({ ...form, eppComplete: v })} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Certificaciones / habilitaciones</Label>
          <Textarea
            value={form.certifications}
            onChange={(e) => setForm({ ...form, certifications: e.target.value })}
            rows={2}
            placeholder="Curso de altura, soldadura, etc."
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Notas de habilitacion</Label>
          <Textarea
            value={form.habilitationNotes}
            onChange={(e) => setForm({ ...form, habilitationNotes: e.target.value })}
            rows={2}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Observaciones internas</Label>
          <Textarea
            value={form.complianceNotes}
            onChange={(e) => setForm({ ...form, complianceNotes: e.target.value })}
            rows={2}
          />
        </div>
      </div>
      <Button onClick={handleSave} className="w-full bg-blue-800 hover:bg-blue-900">
        {editingId ? "Actualizar legajo" : "Registrar personal"}
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <HardHat className="h-5 w-5 text-orange-500" />
          {isCliente(role)
            ? "Personal que trabajara en su obra"
            : "Personal en obra — legajo y seguridad"}
        </CardTitle>
        {isCliente(role) && (
          <p className="text-xs text-muted-foreground mt-1">
            Documentacion de quienes ejecutan el trabajo en su sitio: ART, seguros y antecedentes que
            el proveedor comparte con usted. Si falta algo, use Consultas y justificaciones.
          </p>
        )}
        {isAdmin(role) && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-800 hover:bg-blue-900" onClick={openCreate}>
                <Plus className="mr-1 h-4 w-4" /> Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingId ? "Editar legajo" : "Alta de personal"}
                </DialogTitle>
              </DialogHeader>
              <FormFields />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-8">
            <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">Registra el personal que interviene en esta obra</p>
          </div>
        ) : (
          <div className="space-y-2">
            {workers.map((w) => {
              const level = (w.compliance?.level ?? "INCOMPLETO") as ComplianceLevel;
              return (
                <div
                  key={w.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-blue-700" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{w.name}</p>
                        <Badge className={`text-[10px] ${complianceBadgeClass(level)}`} variant="secondary">
                          {complianceLabel(level)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {w.workerRole || "Sin puesto"} · DNI {w.dni || "—"}
                        {w.cuil ? ` · CUIL ${w.cuil}` : w.cuit ? ` · CUIT ${w.cuit}` : ""}
                        {w.artNumber ? ` · ART ${w.artNumber}` : ""}
                        {requireBg && w.backgroundCheckStatus
                          ? ` · Antecedentes: ${BG_LABELS[w.backgroundCheckStatus] ?? w.backgroundCheckStatus}`
                          : ""}
                      </p>
                      {w.compliance?.issues?.length > 0 && (
                        <p className="text-[11px] text-amber-700 mt-1">{w.compliance.issues.join(" · ")}</p>
                      )}
                    </div>
                  </div>
                  {isAdmin(role) && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(w)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(w.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
