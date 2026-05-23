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
import { ListTodo, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { isAdmin, isSpecialist } from "@/lib/roles";

const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_CURSO: "En curso",
  BLOQUEADA: "Bloqueada",
  HECHA: "Hecha",
  CANCELADA: "Cancelada",
};

const priorityLabels: Record<string, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

export function ProjectTasksTab({
  projectId,
  role,
}: {
  projectId: string;
  role: string;
}) {
  const canEdit = isAdmin(role) || isSpecialist(role);
  const [tasks, setTasks] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIA",
    dueAt: "",
  });
  const [msForm, setMsForm] = useState({ name: "", dueDate: "", percentComplete: "0" });

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/projects/${projectId}/tasks`).then((r) => r.json()),
      fetch(`/api/projects/${projectId}/milestones`).then((r) => r.json()),
    ])
      .then(([t, m]) => {
        setTasks(Array.isArray(t) ? t : []);
        setMilestones(Array.isArray(m) ? m : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const addTask = async () => {
    if (!form.title) {
      toast.error("Titulo requerido");
      return;
    }
    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      toast.error("Error");
      return;
    }
    toast.success("Tarea creada");
    setForm({ title: "", description: "", priority: "MEDIA", dueAt: "" });
    load();
  };

  const setStatus = async (taskId: string, status: string) => {
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const addMilestone = async () => {
    if (!msForm.name) return;
    const res = await fetch(`/api/projects/${projectId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: msForm.name,
        dueDate: msForm.dueDate || undefined,
        percentComplete: Number(msForm.percentComplete),
      }),
    });
    if (!res.ok) {
      toast.error("Error");
      return;
    }
    setMsForm({ name: "", dueDate: "", percentComplete: "0" });
    load();
  };

  const open = tasks.filter((t) => !["HECHA", "CANCELADA"].includes(t.status));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Tareas operativas ({open.length} abiertas)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canEdit && (
            <div className="grid sm:grid-cols-2 gap-3 p-3 border rounded-lg bg-muted/20">
              <div className="space-y-2 sm:col-span-2">
                <Label>Titulo *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Cargar plano rev.2, pedir remito cemento..."
                />
              </div>
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vence</Label>
                <Input
                  type="date"
                  value={form.dueAt}
                  onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Detalle</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </div>
              <Button onClick={addTask} className="bg-blue-800 hover:bg-blue-900 sm:col-span-2">
                <Plus className="mr-1 h-4 w-4" /> Agregar tarea
              </Button>
            </div>
          )}
          {loading ? (
            <div className="h-16 bg-muted animate-pulse rounded" />
          ) : (
            <ul className="space-y-2">
              {tasks.map((t) => (
                <li key={t.id} className="p-3 border rounded-lg flex flex-wrap gap-2 justify-between">
                  <div>
                    <p className={`font-medium text-sm ${t.status === "HECHA" ? "line-through text-muted-foreground" : ""}`}>
                      {t.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {priorityLabels[t.priority]} · {statusLabels[t.status]}
                      {t.dueAt
                        ? ` · ${new Date(t.dueAt).toLocaleDateString("es-AR")}`
                        : ""}
                    </p>
                  </div>
                  {canEdit && t.status !== "HECHA" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(t.id, "HECHA")}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hitos / cronograma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {canEdit && (
            <div className="flex flex-wrap gap-2 items-end">
              <Input
                placeholder="Nombre hito"
                value={msForm.name}
                onChange={(e) => setMsForm({ ...msForm, name: e.target.value })}
                className="max-w-xs"
              />
              <Input
                type="date"
                value={msForm.dueDate}
                onChange={(e) => setMsForm({ ...msForm, dueDate: e.target.value })}
              />
              <Button size="sm" onClick={addMilestone}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
          <ul className="space-y-2">
            {milestones.map((m) => (
              <li key={m.id} className="flex justify-between items-center p-2 border rounded text-sm">
                <span>{m.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{m.percentComplete}%</Badge>
                  {m.dueDate && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(m.dueDate).toLocaleDateString("es-AR")}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
