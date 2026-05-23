"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HardHat, Plus } from "lucide-react";
import { toast } from "sonner";
import { isAdmin, isSpecialist } from "@/lib/roles";

export function HseTab({ projectId, role }: { projectId: string; role: string }) {
  const canEdit = isAdmin(role) || isSpecialist(role);
  const [data, setData] = useState<{ incidents: any[]; permits: any[]; inspections: any[] }>({
    incidents: [],
    permits: [],
    inspections: [],
  });
  const [kind, setKind] = useState<"incident" | "permit" | "inspection">("incident");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", workType: "", severity: "LEVE" });

  const load = useCallback(() => {
    fetch(`/api/projects/${projectId}/hse`)
      .then((r) => r.json())
      .then((d) => setData({ incidents: d.incidents ?? [], permits: d.permits ?? [], inspections: d.inspections ?? [] }))
      .catch(console.error);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    try {
      const body =
        kind === "incident"
          ? { kind, title: form.title, description: form.description, severity: form.severity }
          : kind === "permit"
            ? { kind, workType: form.workType || form.title, description: form.description }
            : { kind, title: form.title, observations: form.description, result: "CONFORME" };
      const res = await fetch(`/api/projects/${projectId}/hse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Registro HSE guardado (Ley 19.587 / SRT)");
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
          <HardHat className="h-5 w-5 text-amber-600" /> Seguridad e higiene
        </CardTitle>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setKind("incident")}>
                <Plus className="h-4 w-4 mr-1" /> Registrar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registro HSE</DialogTitle>
              </DialogHeader>
              <Tabs value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="incident">Incidente</TabsTrigger>
                  <TabsTrigger value="permit">Permiso trabajo</TabsTrigger>
                  <TabsTrigger value="inspection">Inspeccion</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="space-y-3 mt-3">
                <div>
                  <Label>Titulo / tipo</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label>Detalle</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <Button onClick={create} className="w-full">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="incidents">
          <TabsList>
            <TabsTrigger value="incidents">Incidentes ({data.incidents.length})</TabsTrigger>
            <TabsTrigger value="permits">Permisos ({data.permits.length})</TabsTrigger>
            <TabsTrigger value="inspections">Inspecciones ({data.inspections.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="incidents" className="space-y-2 mt-3">
            {data.incidents.map((i) => (
              <div key={i.id} className="p-3 border rounded-lg flex justify-between">
                <div>
                  <p className="font-medium text-sm">{i.title}</p>
                  <p className="text-xs text-muted-foreground">{i.description}</p>
                </div>
                <Badge>{i.severity}</Badge>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="permits" className="space-y-2 mt-3">
            {data.permits.map((p) => (
              <div key={p.id} className="p-3 border rounded-lg">
                <p className="font-mono text-xs">{p.permitNumber}</p>
                <p className="font-medium text-sm">{p.workType}</p>
                <Badge className="mt-1">{p.status}</Badge>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="inspections" className="space-y-2 mt-3">
            {data.inspections.map((s) => (
              <div key={s.id} className="p-3 border rounded-lg flex justify-between">
                <p className="font-medium text-sm">{s.title}</p>
                <Badge>{s.result}</Badge>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
