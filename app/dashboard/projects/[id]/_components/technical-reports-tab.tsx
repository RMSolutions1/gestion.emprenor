"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileCheck, Plus, Trash2, Check, X, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ROLE_LABELS } from "@/lib/roles";
import { isAdmin, isCliente, isSpecialist } from "@/lib/roles";

const reportTypeLabels: Record<string, string> = {
  INFORME: "Informe tecnico",
  CONFORMIDAD: "Conformidad de obra",
  NO_CONFORMIDAD: "No conformidad",
  SOLICITUD_CORRECCION: "Solicitud de correccion",
  ACTA_INSPECCION: "Acta de inspeccion",
};

const statusLabels: Record<string, string> = {
  BORRADOR: "Borrador",
  PENDIENTE_CLIENTE: "Pendiente cliente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
  EN_CORRECCION: "En correccion",
};

const statusColors: Record<string, string> = {
  BORRADOR: "bg-gray-100 text-gray-800",
  PENDIENTE_CLIENTE: "bg-amber-100 text-amber-800",
  APROBADO: "bg-green-100 text-green-800",
  RECHAZADO: "bg-red-100 text-red-800",
  EN_CORRECCION: "bg-orange-100 text-orange-800",
};

export function TechnicalReportsTab({ projectId, role, userId }: { projectId: string; role: string; userId?: string }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    reportType: "INFORME",
  });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);

  const canCreate = isAdmin(role) || isSpecialist(role);
  const pendingForClient = reports.filter((r) => r.status === "PENDIENTE_CLIENTE");

  const fetchReports = useCallback(() => {
    setLoading(true);
    fetch(`/api/technical-reports?projectId=${projectId}`)
      .then((r) => r.json())
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleCreate = async () => {
    if (!form.title) {
      toast.error("Titulo requerido");
      return;
    }
    try {
      const res = await fetch("/api/technical-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, projectId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Informe registrado");
      setDialogOpen(false);
      setForm({ title: "", description: "", reportType: "INFORME" });
      fetchReports();
    } catch {
      toast.error("Error");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/technical-reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        status === "APROBADO"
          ? "Autorizado correctamente"
          : status === "RECHAZADO"
            ? "Informe rechazado"
            : "Estado actualizado"
      );
      fetchReports();
    } catch {
      toast.error("Error");
    } finally {
      setBusyId(null);
      setRejectId(null);
    }
  };

  const submitToClient = async (id: string) => {
    await updateStatus(id, "PENDIENTE_CLIENTE");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar informe?")) return;
    try {
      await fetch(`/api/technical-reports/${id}`, { method: "DELETE" });
      toast.success("Eliminado");
      fetchReports();
    } catch {
      toast.error("Error");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Informes y conformidades
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Ingenieros e inspectores cargan informes; el cliente aprueba correcciones cuando corresponde.
          </p>
        </div>
        {canCreate && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-800 hover:bg-blue-900">
                <Plus className="mr-1 h-4 w-4" /> Nuevo informe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Cargar informe / conformidad</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={form.reportType}
                    onValueChange={(v) => setForm({ ...form, reportType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(reportTypeLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Titulo *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Detalle</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    placeholder="Observaciones, items a corregir, conformidad parcial..."
                  />
                </div>
                <Button onClick={handleCreate} className="w-full bg-blue-800 hover:bg-blue-900">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {isCliente(role) && pendingForClient.length > 0 && (
          <div className="mb-4 p-4 rounded-lg border-2 border-amber-300 bg-amber-50 space-y-3">
            <p className="text-sm font-medium text-amber-900">
              {pendingForClient.length} informe(s) esperan su autorizacion
            </p>
            {pendingForClient.map((r) => (
              <div
                key={`quick-${r.id}`}
                className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg bg-white border"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {reportTypeLabels[r.reportType]}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-700 hover:bg-green-800"
                    disabled={!!busyId}
                    onClick={() => updateStatus(r.id, "APROBADO")}
                  >
                    {busyId === r.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" /> Autorizar
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!!busyId}
                    onClick={() => setRejectId(r.id)}
                  >
                    <X className="h-4 w-4 mr-1" /> Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="h-16 bg-muted animate-pulse rounded-lg" />
        ) : reports.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sin informes cargados</p>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="p-4 rounded-lg border space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {reportTypeLabels[r.reportType]} · {ROLE_LABELS[r.author?.role] ?? ""} ·{" "}
                      {r.author?.name}
                    </p>
                  </div>
                  <Badge className={`text-[10px] ${statusColors[r.status] ?? ""}`} variant="secondary">
                    {statusLabels[r.status] ?? r.status}
                  </Badge>
                </div>
                {r.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.description}</p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {isCliente(role) && r.status === "PENDIENTE_CLIENTE" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-700 hover:bg-green-800"
                        disabled={!!busyId}
                        onClick={() => updateStatus(r.id, "APROBADO")}
                      >
                        {busyId === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" /> Autorizar
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        disabled={!!busyId}
                        onClick={() => setRejectId(r.id)}
                      >
                        <X className="h-4 w-4 mr-1" /> Rechazar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!!busyId}
                        onClick={() => updateStatus(r.id, "EN_CORRECCION")}
                      >
                        Solicitar correccion
                      </Button>
                    </>
                  )}
                  {(isAdmin(role) || r.authorId === userId) && r.status === "BORRADOR" && (
                    <Button size="sm" variant="outline" onClick={() => submitToClient(r.id)}>
                      <Send className="h-4 w-4 mr-1" /> Enviar al cliente
                    </Button>
                  )}
                  {isAdmin(role) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(r.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <AlertDialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar informe</AlertDialogTitle>
            <AlertDialogDescription>
              Emprenor sera notificado. Puede solicitar una correccion en su lugar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => rejectId && updateStatus(rejectId, "RECHAZADO")}
            >
              Rechazar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
