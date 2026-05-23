"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShieldCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { isAdmin, isSpecialist } from "@/lib/roles";

const statusLabels: Record<string, string> = {
  ABIERTA: "Abierta",
  EN_TRATAMIENTO: "En tratamiento",
  CERRADA: "Cerrada",
};

export function QualityTab({ projectId, role }: { projectId: string; role: string }) {
  const canEdit = isAdmin(role) || isSpecialist(role);
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    isoClause: "",
    correctiveTitle: "",
  });

  const load = useCallback(() => {
    fetch(`/api/projects/${projectId}/quality-nc`)
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
      const res = await fetch(`/api/projects/${projectId}/quality-nc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("No conformidad registrada (ISO 9001)");
      setOpen(false);
      load();
    } catch {
      toast.error("Error");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" /> Calidad — QMS / IRAM
        </CardTitle>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Nueva NC
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>No conformidad</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Titulo</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label>Clausula ISO / IRAM</Label>
                  <Input value={form.isoClause} onChange={(e) => setForm({ ...form, isoClause: e.target.value })} />
                </div>
                <div>
                  <Label>Descripcion</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <Label>Accion correctiva (CAPA)</Label>
                  <Input value={form.correctiveTitle} onChange={(e) => setForm({ ...form, correctiveTitle: e.target.value })} />
                </div>
                <Button onClick={create} className="w-full">
                  Registrar NC + CAPA
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Sin no conformidades</p>
        ) : (
          items.map((nc) => (
            <div key={nc.id} className="p-3 border rounded-lg">
              <div className="flex justify-between">
                <span className="font-mono text-xs">{nc.code}</span>
                <Badge variant="secondary">{statusLabels[nc.status] ?? nc.status}</Badge>
              </div>
              <p className="font-medium text-sm mt-1">{nc.title}</p>
              {nc.isoClause && <p className="text-xs text-muted-foreground">Clausula: {nc.isoClause}</p>}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
