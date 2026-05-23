"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { HardHat, Plus, Trash2, Mail, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/animate";
import { ROLE_LABELS, SPECIALIST_ROLES } from "@/lib/roles";

export function TeamContent() {
  const { data: session, status: sessionStatus } = useSession() || {};
  const router = useRouter();
  const [members, setMembers] = useState<
    Array<{ id: string; name: string; email: string; role: string; createdAt: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "INGENIERO_CIVIL" as string,
  });
  const role = (session?.user as { role?: string })?.role;

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }
    fetchTeam();
  }, [role, sessionStatus, router]);

  const fetchTeam = () => {
    fetch("/api/users?type=team")
      .then((r) => r.json())
      .then((data) => setMembers(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Todos los campos son requeridos");
      return;
    }
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Error");
        return;
      }
      toast.success("Especialista creado");
      setDialogOpen(false);
      setForm({ name: "", email: "", password: "", role: "INGENIERO_CIVIL" });
      fetchTeam();
    } catch {
      toast.error("Error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este usuario del equipo?")) return;
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      toast.success("Usuario eliminado");
      fetchTeam();
    } catch {
      toast.error("Error");
    }
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (ROLE_LABELS[m.role] ?? m.role).toLowerCase().includes(search.toLowerCase())
  );

  if (sessionStatus === "loading" || role !== "ADMIN") return null;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight">Equipo tecnico</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Ingenieros, arquitectos e inspectores que cargan informes y conformidades
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-800 hover:bg-blue-900">
                <UserPlus className="mr-2 h-4 w-4" /> Nuevo especialista
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Alta de especialista</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Especialidad *</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIST_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contrasena inicial *</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreate} className="w-full bg-blue-800 hover:bg-blue-900">
                  Crear cuenta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HardHat className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hay especialistas registrados</p>
          </CardContent>
        </Card>
      ) : (
        <Stagger className="grid gap-3">
          {filtered.map((m) => (
            <StaggerItem key={m.id}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <HardHat className="h-4 w-4 text-orange-500" />
                      {m.name}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground space-y-1">
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> {m.email}
                  </p>
                  <p>{ROLE_LABELS[m.role] ?? m.role}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
