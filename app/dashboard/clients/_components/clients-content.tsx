"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Trash2, Mail, Calendar, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/animate";

export function ClientsContent() {
  const { data: session, status: sessionStatus } = useSession() || {};
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
    fetchClients();
  }, [role, sessionStatus, router]);

  const fetchClients = () => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data: any) => setClients(Array.isArray(data) ? data : []))
      .catch((e: any) => console.error(e))
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { toast.error("Todos los campos son requeridos"); return; }
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error ?? "Error"); return; }
      toast.success("Cliente creado");
      setDialogOpen(false);
      setForm({ name: "", email: "", password: "" });
      fetchClients();
    } catch (e: any) { console.error(e); toast.error("Error"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("\u00bfEliminar este cliente? Se eliminaran todas sus asignaciones.")) return;
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      toast.success("Cliente eliminado");
      fetchClients();
    } catch (e: any) { console.error(e); toast.error("Error"); }
  };

  const filtered = clients?.filter?.((c: any) =>
    (c?.name ?? "")?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? "") ||
    (c?.email ?? "")?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? "")
  ) ?? [];

  if (sessionStatus === "loading" || role !== "ADMIN") return null;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight">Gestion de Clientes</h1>
            <p className="text-muted-foreground text-sm mt-1">Crear y administrar cuentas de clientes</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-800 hover:bg-blue-900">
                <UserPlus className="mr-2 h-4 w-4" /> Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Crear Cuenta de Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2"><Label>Nombre *</Label><Input value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} placeholder="Nombre completo" /></div>
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })} placeholder="cliente@email.com" /></div>
                <div className="space-y-2"><Label>Contrasena *</Label><Input type="password" value={form.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, password: e.target.value })} placeholder="Contrasena inicial" /></div>
                <Button onClick={handleCreate} className="w-full bg-blue-800 hover:bg-blue-900">Crear Cliente</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar clientes..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3]?.map?.((i: number) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : (filtered?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No se encontraron clientes</p>
          </CardContent>
        </Card>
      ) : (
        <Stagger className="space-y-2">
          {filtered?.map?.((client: any) => (
            <StaggerItem key={client?.id}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-800 font-bold text-sm">
                        {(client?.name ?? "C")?.charAt?.(0)?.toUpperCase?.()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{client?.name ?? ""}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {client?.email ?? ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {client?.createdAt ? new Date(client.createdAt).toLocaleDateString("es-AR") : ""}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(client?.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          )) ?? []}
        </Stagger>
      )}
    </div>
  );
}
