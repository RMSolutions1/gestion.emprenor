"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const statusLabels: Record<string, string> = { PENDIENTE: "Pendiente", EN_PROCESO: "En Proceso", RESUELTA: "Resuelta" };
const statusColors: Record<string, string> = {
  PENDIENTE: "bg-red-100 text-red-800", EN_PROCESO: "bg-yellow-100 text-yellow-800", RESUELTA: "bg-green-100 text-green-800",
};

export function IncidentsTab({ projectId, role }: { projectId: string; role: string }) {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", status: "PENDIENTE" });

  const fetchIncidents = useCallback(() => {
    fetch(`/api/incidents?projectId=${projectId}`)
      .then((r) => r.json())
      .then((data: any) => setIncidents(Array.isArray(data) ? data : []))
      .catch((e: any) => console.error(e))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const handleSave = async () => {
    if (!form.title) { toast.error("El titulo es requerido"); return; }
    try {
      const url = editingId ? `/api/incidents/${editingId}` : "/api/incidents";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? form : { ...form, projectId };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Incidencia actualizada" : "Incidencia creada");
      setDialogOpen(false);
      setEditingId(null);
      setForm({ title: "", description: "", status: "PENDIENTE" });
      fetchIncidents();
    } catch (e: any) { console.error(e); toast.error("Error"); }
  };

  const openEdit = (inc: any) => {
    setEditingId(inc?.id ?? null);
    setForm({ title: inc?.title ?? "", description: inc?.description ?? "", status: inc?.status ?? "PENDIENTE" });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", description: "", status: "PENDIENTE" });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("\u00bfEliminar esta incidencia?")) return;
    try {
      await fetch(`/api/incidents/${id}`, { method: "DELETE" });
      toast.success("Eliminada");
      fetchIncidents();
    } catch (e: any) { console.error(e); toast.error("Error"); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" /> Incidencias
        </CardTitle>
        {role === "ADMIN" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-800 hover:bg-blue-900" onClick={openCreate}>
                <Plus className="mr-1 h-4 w-4" /> Nueva
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">{editingId ? "Editar" : "Nueva"} Incidencia</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2"><Label>Titulo *</Label><Input value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Descripcion</Label><Textarea value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={form.status} onValueChange={(v: string) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(statusLabels)?.map?.(([k, v]: [string, string]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} className="w-full bg-blue-800 hover:bg-blue-900">{editingId ? "Actualizar" : "Crear"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">{[1, 2]?.map?.((i: number) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}</div>
        ) : (incidents?.length ?? 0) === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No hay incidencias registradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {incidents?.map?.((inc: any) => (
              <div key={inc?.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{inc?.title ?? ""}</p>
                  {inc?.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{inc.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{inc?.createdAt ? new Date(inc.createdAt).toLocaleDateString("es-AR") : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${statusColors?.[inc?.status] ?? ''}`} variant="secondary">{statusLabels?.[inc?.status] ?? inc?.status}</Badge>
                  {role === "ADMIN" && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(inc)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(inc?.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </>
                  )}
                </div>
              </div>
            )) ?? []}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
