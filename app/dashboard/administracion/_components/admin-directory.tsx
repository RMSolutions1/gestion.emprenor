"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import {
  Building2,
  Users,
  HardHat,
  FolderKanban,
  Plus,
  Trash2,
  Database,
  Search,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/animate";
import type { AdminDirectorySnapshot } from "@/lib/data/directory";
import {
  createDirectoryUser,
  deleteDirectoryUser,
  updateOrganizationProfile,
} from "@/lib/actions/directory";
import { EMPRENOR_BRAND } from "@/lib/emprenor-clients";
import type { Role } from "@prisma/client";
import { ClientProfileDialog } from "@/components/clients/client-profile-dialog";
import { completenessTone } from "@/lib/client-profile";
import { UserCircle } from "lucide-react";

const CLIENT_ROLES: Role[] = ["CLIENTE"];
const EMPLOYEE_ROLES: Role[] = [
  "ADMIN",
  "INGENIERO_CIVIL",
  "ARQUITECTO",
  "INGENIERO_ELECTRICO",
  "INSPECTOR_CALIDAD",
  "INSPECTOR_OBRA",
];

export function AdminDirectory({
  initial,
}: {
  initial: AdminDirectorySnapshot;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "resumen";
  const [data, setData] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKind, setDialogKind] = useState<"client" | "employee">("client");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIENTE" as Role,
  });
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [profileUserName, setProfileUserName] = useState("");
  const [orgForm, setOrgForm] = useState({
    name: data.organization?.name ?? "",
    legalName: data.organization?.legalName ?? "",
    billingEmail: data.organization?.billingEmail ?? "",
    industry: data.organization?.industry ?? "",
  });

  const refresh = () => router.refresh();

  const openCreate = (kind: "client" | "employee") => {
    setDialogKind(kind);
    setForm({
      name: "",
      email: "",
      password: "",
      role: kind === "client" ? "CLIENTE" : "INSPECTOR_OBRA",
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    startTransition(async () => {
      const res = await createDirectoryUser({
        ...form,
        organizationId: data.organization?.id,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Usuario creado en la base emprenor");
      setDialogOpen(false);
      refresh();
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Eliminar a ${name}?`)) return;
    startTransition(async () => {
      const res = await deleteDirectoryUser(id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Eliminado");
      refresh();
    });
  };

  const handleOrgSave = () => {
    startTransition(async () => {
      const res = await updateOrganizationProfile(orgForm);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Empresa actualizada");
      refresh();
    });
  };

  const q = search.toLowerCase();
  const match = (s: string) => s.toLowerCase().includes(q);

  const filteredClients = data.clients.filter(
    (u) => !q || match(u.name) || match(u.email)
  );
  const filteredEmployees = data.employees.filter(
    (u) => !q || match(u.name) || match(u.email)
  );
  const filteredProjects = data.projects.filter(
    (p) => !q || match(p.name) || match(p.address)
  );

  const UserList = ({
    items,
    emptyLabel,
    showProfile,
  }: {
    items: typeof data.clients;
    emptyLabel: string;
    showProfile?: boolean;
  }) => (
    <ul className="space-y-2">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">{emptyLabel}</p>
      ) : (
        items.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between gap-2 p-3 rounded-lg border"
          >
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{u.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3 shrink-0" />
                {u.email}
              </p>
              <div className="flex gap-1 mt-1 flex-wrap">
                <Badge variant="secondary" className="text-[10px]">
                  {u.roleLabel}
                </Badge>
                {data.scope === "platform" && u.organizationName && (
                  <Badge variant="outline" className="text-[10px]">
                    {u.organizationName}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {u.projectCount} obra(s)
                </span>
                {showProfile && u.profileCompleteness !== undefined && (
                  <Badge
                    variant="outline"
                    className={
                      completenessTone(u.profileCompleteness) === "low"
                        ? "text-[10px] border-amber-300 text-amber-800"
                        : completenessTone(u.profileCompleteness) === "high"
                          ? "text-[10px] border-emerald-300 text-emerald-800"
                          : "text-[10px]"
                    }
                  >
                    Ficha {u.profileCompleteness}%
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              {showProfile && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => {
                    setProfileUserId(u.id);
                    setProfileUserName(u.name);
                  }}
                >
                  <UserCircle className="h-3.5 w-3.5 mr-1" />
                  Ficha
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive h-8 w-8 p-0"
                disabled={pending}
                onClick={() => handleDelete(u.id, u.name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))
      )}
    </ul>
  );

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Database className="h-6 w-6 text-blue-800" />
              <h1 className="text-2xl font-bold font-display tracking-tight">
                Administracion central
              </h1>
              <Badge className="bg-green-100 text-green-800 border-0">BD emprenor</Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
              {EMPRENOR_BRAND.name}: una sola base PostgreSQL para empresa, empleados, clientes y
              obras. Sin duplicar datos ni APIs paralelas.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {dialogKind === "client" ? "Nuevo cliente" : "Nuevo empleado"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contraseña inicial</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select
                    value={form.role}
                    onValueChange={(v) => setForm({ ...form, role: v as Role })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(dialogKind === "client" ? CLIENT_ROLES : EMPLOYEE_ROLES).map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={pending}
                  className="w-full bg-blue-800 hover:bg-blue-900"
                >
                  Guardar en base emprenor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </FadeIn>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Clientes", value: data.stats.clients, icon: Users },
          { label: "Empleados", value: data.stats.employees, icon: HardHat },
          { label: "Obras", value: data.stats.projects, icon: FolderKanban },
          { label: "Personal en obra", value: data.stats.workersOnSite, icon: Building2 },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="h-8 w-8 text-blue-800/70" />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar en directorio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => router.push(`/dashboard/administracion?tab=${v}`)}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="empleados">Empleados</TabsTrigger>
          <TabsTrigger value="obras">Obras</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cartera activa (misma BD)</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-3">
              {data.projects.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}`}
                  className="p-3 rounded-lg border hover:border-blue-300 transition-colors"
                >
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.clientNames.join(", ") || "Sin cliente asignado"}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Clientes</CardTitle>
              <Button
                size="sm"
                className="bg-blue-800 hover:bg-blue-900"
                onClick={() => openCreate("client")}
              >
                <Plus className="mr-1 h-4 w-4" /> Cliente
              </Button>
            </CardHeader>
            <CardContent>
              <UserList items={filteredClients} emptyLabel="Sin clientes" showProfile />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empleados" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Empleados y equipo tecnico</CardTitle>
              <Button
                size="sm"
                className="bg-blue-800 hover:bg-blue-900"
                onClick={() => openCreate("employee")}
              >
                <Plus className="mr-1 h-4 w-4" /> Empleado
              </Button>
            </CardHeader>
            <CardContent>
              <UserList items={filteredEmployees} emptyLabel="Sin empleados" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="obras" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Proyectos / obras</CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/projects">
                  <FolderKanban className="mr-1 h-4 w-4" /> Gestionar obras
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {filteredProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">Sin obras</p>
                ) : (
                  filteredProjects.map((p) => (
                    <li key={p.id} className="p-3 rounded-lg border flex justify-between gap-2">
                      <div>
                        <Link
                          href={`/dashboard/projects/${p.id}`}
                          className="font-medium text-sm text-blue-800 hover:underline"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{p.address}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {p.workersCount} en legajo · {p.siteType}
                        </p>
                      </div>
                      <Badge variant="secondary">{p.status}</Badge>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresa" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datos de la empresa (tenant)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              {data.organization ? (
                <>
                  <div className="space-y-2">
                    <Label>Nombre comercial</Label>
                    <Input
                      value={orgForm.name}
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Razon social</Label>
                    <Input
                      value={orgForm.legalName}
                      onChange={(e) => setOrgForm({ ...orgForm, legalName: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Plan: {data.organization.plan} · Estado: {data.organization.status} · Slug:{" "}
                    {data.organization.slug}
                  </p>
                  <Button
                    onClick={handleOrgSave}
                    disabled={pending}
                    className="bg-blue-800 hover:bg-blue-900"
                  >
                    Guardar empresa
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Vista multi-tenant: {data.organizations.length} organizacion(es) en la misma
                  base.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ClientProfileDialog
        userId={profileUserId}
        userName={profileUserName}
        open={!!profileUserId}
        onOpenChange={(o) => !o && setProfileUserId(null)}
        onSaved={() => refresh()}
      />
    </div>
  );
}
