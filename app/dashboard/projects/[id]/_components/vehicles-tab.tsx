"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Truck, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { complianceBadgeClass, complianceLabel, type ComplianceLevel } from "@/lib/compliance";

const emptyForm = {
  label: "",
  plate: "",
  driverName: "",
  driverLicense: "",
  driverLicenseExpiry: "",
  technicalReviewExpiry: "",
  insuranceExpiry: "",
  artExpiry: "",
  notes: "",
};

export function VehiclesTab({ projectId, role }: { projectId: string; role: string }) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchVehicles = useCallback(() => {
    setLoading(true);
    fetch(`/api/vehicles?projectId=${projectId}`)
      .then((r) => r.json())
      .then((data) => setVehicles(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSave = async () => {
    if (!form.label) {
      toast.error("Identificacion del vehiculo requerida");
      return;
    }
    try {
      const url = editingId ? `/api/vehicles/${editingId}` : "/api/vehicles";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? form : { ...form, projectId };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Vehiculo actualizado" : "Vehiculo registrado");
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchVehicles();
    } catch {
      toast.error("Error al guardar");
    }
  };

  const openEdit = (v: any) => {
    setEditingId(v.id);
    setForm({
      label: v.label ?? "",
      plate: v.plate ?? "",
      driverName: v.driverName ?? "",
      driverLicense: v.driverLicense ?? "",
      driverLicenseExpiry: v.driverLicenseExpiry
        ? new Date(v.driverLicenseExpiry).toISOString().split("T")[0]
        : "",
      technicalReviewExpiry: v.technicalReviewExpiry
        ? new Date(v.technicalReviewExpiry).toISOString().split("T")[0]
        : "",
      insuranceExpiry: v.insuranceExpiry
        ? new Date(v.insuranceExpiry).toISOString().split("T")[0]
        : "",
      artExpiry: v.artExpiry ? new Date(v.artExpiry).toISOString().split("T")[0] : "",
      notes: v.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este vehiculo?")) return;
    try {
      await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      toast.success("Eliminado");
      fetchVehicles();
    } catch {
      toast.error("Error");
    }
  };

  const formContent = (
    <div className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto">
      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
        El cliente puede verificar patente, licencia del conductor, VTV, seguro y ART del transporte.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2 sm:col-span-2">
          <Label>Vehiculo / unidad *</Label>
          <Input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Camioneta Hilux, furgon, etc."
          />
        </div>
        <div className="space-y-2">
          <Label>Patente</Label>
          <Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Conductor</Label>
          <Input value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Licencia de conducir</Label>
          <Input
            value={form.driverLicense}
            onChange={(e) => setForm({ ...form, driverLicense: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Venc. licencia</Label>
          <Input
            type="date"
            value={form.driverLicenseExpiry}
            onChange={(e) => setForm({ ...form, driverLicenseExpiry: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>VTV / revision tecnica</Label>
          <Input
            type="date"
            value={form.technicalReviewExpiry}
            onChange={(e) => setForm({ ...form, technicalReviewExpiry: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Seguro del vehiculo</Label>
          <Input
            type="date"
            value={form.insuranceExpiry}
            onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>ART transporte</Label>
          <Input
            type="date"
            value={form.artExpiry}
            onChange={(e) => setForm({ ...form, artExpiry: e.target.value })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Notas</Label>
          <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
        </div>
      </div>
      <Button onClick={handleSave} className="w-full bg-blue-800 hover:bg-blue-900">
        {editingId ? "Actualizar" : "Registrar vehiculo"}
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Truck className="h-5 w-5 text-teal-600" />
          Transporte y movilidad
        </CardTitle>
        {role === "ADMIN" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-blue-800 hover:bg-blue-900"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                <Plus className="mr-1 h-4 w-4" /> Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">
                  {editingId ? "Editar vehiculo" : "Alta de vehiculo"}
                </DialogTitle>
              </DialogHeader>
              {formContent}
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-20 bg-muted animate-pulse rounded-lg" />
        ) : vehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Registra los vehiculos que trasladan personal a la obra
          </p>
        ) : (
          <ul className="space-y-2">
            {vehicles.map((v) => {
              const level = (v.compliance?.level ?? "INCOMPLETO") as ComplianceLevel;
              return (
                <li
                  key={v.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{v.label}</span>
                      {v.plate && (
                        <span className="text-xs text-muted-foreground">{v.plate}</span>
                      )}
                      <Badge className={`text-[10px] ${complianceBadgeClass(level)}`} variant="secondary">
                        {complianceLabel(level)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Conductor: {v.driverName || "—"}
                    </p>
                    {v.compliance?.issues?.length > 0 && (
                      <p className="text-[11px] text-amber-700 mt-1">{v.compliance.issues.join(" · ")}</p>
                    )}
                  </div>
                  {role === "ADMIN" && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(v)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(v.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
