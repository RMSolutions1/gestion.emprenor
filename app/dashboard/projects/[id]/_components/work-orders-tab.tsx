"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardList, Plus } from "lucide-react";
import { toast } from "sonner";
import { isAdmin, isSpecialist } from "@/lib/roles";

const statusLabels: Record<string, string> = {
  BORRADOR: "Borrador",
  ASIGNADA: "Asignada",
  EN_EJECUCION: "En ejecucion",
  PENDIENTE_APROBACION: "Pend. aprobacion",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

export function WorkOrdersTab({ projectId, role }: { projectId: string; role: string }) {
  const canEdit = isAdmin(role) || isSpecialist(role);
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "BORRADOR" });

  const load = useCallback(() => {
    fetch(`/api/projects/${projectId}/work-orders`)
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!form.title) {
      toast.error("Titulo requerido");
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}/work-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Orden de trabajo creada");
      setOpen(false);
      setForm({ title: "", description: "", status: "BORRADOR" });
      load();
    } catch {
      toast.error("Error");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-indigo-600" /> Ordenes de trabajo
        </CardTitle>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Nueva OT
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva orden de trabajo</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Titulo</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label>Descripcion</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <Button onClick={create} className="w-full">
                  Crear OT
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay ordenes de trabajo</p>
        ) : (
          items.map((o) => (
            <div key={o.id} className="p-3 border rounded-lg flex justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{o.number}</p>
                <p className="font-medium text-sm">{o.title}</p>
                {o.description && <p className="text-xs text-muted-foreground mt-1">{o.description}</p>}
              </div>
              <Badge variant="secondary">{statusLabels[o.status] ?? o.status}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
