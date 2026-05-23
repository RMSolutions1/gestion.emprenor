"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Trash2, UserPlus, HardHat } from "lucide-react";
import { toast } from "sonner";
import { ROLE_LABELS } from "@/lib/roles";

type UserRow = { id: string; name: string; email: string; role: string };

export function AssignmentsTab({ project, onUpdate }: { project: any; onUpdate: () => void }) {
  const [clients, setClients] = useState<UserRow[]>([]);
  const [team, setTeam] = useState<UserRow[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedSpecialist, setSelectedSpecialist] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/users?type=clients").then((r) => r.json()),
      fetch("/api/users?type=team").then((r) => r.json()),
    ])
      .then(([c, t]) => {
        setClients(Array.isArray(c) ? c : []);
        setTeam(Array.isArray(t) ? t : []);
      })
      .catch(console.error);
  }, []);

  const assignments = project?.assignments ?? [];
  const assignedIds = assignments.map((a: { userId: string }) => a.userId);
  const clientAssignments = assignments.filter((a: { user?: { role?: string } }) =>
    ["CLIENTE"].includes(a?.user?.role ?? "")
  );
  const teamAssignments = assignments.filter((a: { user?: { role?: string } }) =>
    a?.user?.role && a.user.role !== "CLIENTE" && a.user.role !== "ADMIN"
  );

  const availableClients = clients.filter((c) => !assignedIds.includes(c.id));
  const availableTeam = team.filter((t) => !assignedIds.includes(t.id));

  const assign = async (userId: string, clear: () => void) => {
    if (!userId) {
      toast.error("Seleccione un usuario");
      return;
    }
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, projectId: project?.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data?.error ?? "Error");
        return;
      }
      toast.success("Usuario asignado");
      clear();
      onUpdate?.();
    } catch {
      toast.error("Error");
    }
  };

  const handleRemove = async (assignmentId: string) => {
    if (!confirm("¿Quitar acceso a esta obra?")) return;
    try {
      await fetch(`/api/assignments?id=${assignmentId}`, { method: "DELETE" });
      toast.success("Asignacion removida");
      onUpdate?.();
    } catch {
      toast.error("Error");
    }
  };

  const AssignmentList = ({
    items,
    emptyLabel,
  }: {
    items: typeof assignments;
    emptyLabel: string;
  }) =>
    items.length === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-4">{emptyLabel}</p>
    ) : (
      <div className="space-y-2">
        {items.map((a: { id: string; user?: { name?: string; email?: string; role?: string } }) => (
          <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium">{a.user?.name ?? ""}</p>
              <p className="text-xs text-muted-foreground">
                {a.user?.email ?? ""}
                {a.user?.role ? ` · ${ROLE_LABELS[a.user.role] ?? a.user.role}` : ""}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRemove(a.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Clientes con acceso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Cliente a asignar" />
              </SelectTrigger>
              <SelectContent>
                {availableClients.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    Sin clientes disponibles
                  </SelectItem>
                ) : (
                  availableClients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={() => assign(selectedClient, () => setSelectedClient(""))}
              className="bg-blue-800 hover:bg-blue-900"
              disabled={!selectedClient}
            >
              <UserPlus className="mr-1 h-4 w-4" /> Asignar
            </Button>
          </div>
          <AssignmentList items={clientAssignments} emptyLabel="No hay clientes asignados" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <HardHat className="h-5 w-5 text-orange-500" /> Equipo tecnico en obra
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedSpecialist} onValueChange={setSelectedSpecialist}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Especialista a asignar" />
              </SelectTrigger>
              <SelectContent>
                {availableTeam.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    Sin especialistas disponibles
                  </SelectItem>
                ) : (
                  availableTeam.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {ROLE_LABELS[t.role] ?? t.role}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={() => assign(selectedSpecialist, () => setSelectedSpecialist(""))}
              className="bg-blue-800 hover:bg-blue-900"
              disabled={!selectedSpecialist}
            >
              <Plus className="mr-1 h-4 w-4" /> Asignar
            </Button>
          </div>
          <AssignmentList
            items={teamAssignments}
            emptyLabel="Asigne ingenieros o inspectores para informes y conformidades"
          />
        </CardContent>
      </Card>
    </div>
  );
}
