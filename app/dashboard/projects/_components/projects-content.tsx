"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, MapPin, Calendar, FolderKanban, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/animate";
import { SITE_TYPE_OPTIONS } from "@/lib/roles";
import { ENTERPRISE_SECTORS } from "@/lib/enterprise-sectors";

const statusLabels: Record<string, string> = {
  PLANIFICACION: "Planificacion",
  EN_CURSO: "En Curso",
  PAUSADO: "Pausado",
  FINALIZADO: "Finalizado",
};

const statusColors: Record<string, string> = {
  PLANIFICACION: "bg-blue-100 text-blue-800",
  EN_CURSO: "bg-green-100 text-green-800",
  PAUSADO: "bg-yellow-100 text-yellow-800",
  FINALIZADO: "bg-gray-100 text-gray-800",
};

const projectTypes = [
  ...new Set(ENTERPRISE_SECTORS.flatMap((s) => s.projectTypes)),
  "Otro",
];

export function ProjectsContent() {
  const { data: session } = useSession() || {};
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    projectType: "Obra civil",
    siteType: "INDUSTRIA",
    description: "",
    startDate: "",
    endDate: "",
    status: "PLANIFICACION",
  });
  const role = (session?.user as any)?.role ?? "CLIENTE";

  const fetchProjects = () => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data: any) => {
        // Manejar tanto respuesta con paginación como sin paginación
        if (data?.data && Array.isArray(data.data)) {
          setProjects(data.data);
        } else if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setProjects([]);
        }
      })
      .catch((e: any) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async () => {
    if (!form.name) { toast.error("El nombre es requerido"); return; }
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Proyecto creado");
      setDialogOpen(false);
      setForm({
        name: "",
        address: "",
        projectType: "Obra civil",
        siteType: "INDUSTRIA",
        description: "",
        startDate: "",
        endDate: "",
        status: "PLANIFICACION",
      });
      fetchProjects();
    } catch (e: any) {
      console.error(e);
      toast.error("Error al crear proyecto");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" });
      toast.success("Proyecto eliminado");
      fetchProjects();
    } catch (e: any) {
      console.error(e);
      toast.error("Error");
    }
  };

  const filtered = projects?.filter?.((p: any) =>
    (p?.name ?? "")?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? "") ||
    (p?.address ?? "")?.toLowerCase?.()?.includes?.(search?.toLowerCase?.() ?? "")
  ) ?? [];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight">Proyectos</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {role === "ADMIN" ? "Gestion de todos los proyectos de obra" : "Proyectos asignados"}
            </p>
          </div>
          {role === "ADMIN" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-800 hover:bg-blue-900">
                  <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display">Crear Proyecto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Nombre *</Label>
                    <Input value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} placeholder="Nombre del proyecto" />
                  </div>
                  <div className="space-y-2">
                    <Label>Direccion</Label>
                    <Input value={form.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, address: e.target.value })} placeholder="Direccion de la obra" />
                  </div>
                  <div className="space-y-2">
                    <Label>Sector / tipo de sitio</Label>
                    <Select
                      value={form.siteType}
                      onValueChange={(v: string) => {
                        const sector = ENTERPRISE_SECTORS.find((s) => s.siteType === v);
                        setForm({
                          ...form,
                          siteType: v,
                          projectType: sector?.projectTypes[0] ?? form.projectType,
                        });
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SITE_TYPE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de obra / servicio</Label>
                    <Select value={form.projectType} onValueChange={(v: string) => setForm({ ...form, projectType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {projectTypes?.map?.((t: string) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Descripcion</Label>
                    <Textarea value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })} placeholder="Descripcion del proyecto" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Fecha Inicio</Label>
                      <Input type="date" value={form.startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, startDate: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha Fin</Label>
                      <Input type="date" value={form.endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, endDate: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={form.status} onValueChange={(v: string) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels)?.map?.(([k, v]: [string, string]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreate} className="w-full bg-blue-800 hover:bg-blue-900">Crear Proyecto</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </FadeIn>

      {/* Search */}
      <FadeIn delay={0.1}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </FadeIn>

      {/* Project list */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4]?.map?.((i: number) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (filtered?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No se encontraron proyectos</p>
          </CardContent>
        </Card>
      ) : (
        <Stagger className="grid gap-4 md:grid-cols-2">
          {filtered?.map?.((project: any) => (
            <StaggerItem key={project?.id}>
              <Card className="hover:shadow-md transition-all group relative">
                <Link href={`/dashboard/projects/${project?.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors truncate">
                          {project?.name ?? "Sin nombre"}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{project?.address ?? "Sin direccion"}</span>
                        </div>
                      </div>
                      <Badge className={`ml-2 text-xs shrink-0 ${statusColors?.[project?.status] ?? ''}`} variant="secondary">
                        {statusLabels?.[project?.status] ?? project?.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="bg-muted px-2 py-1 rounded">{project?.projectType ?? ""}</span>
                      {project?.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(project.startDate).toLocaleDateString("es-AR")}
                        </span>
                      )}
                    </div>
                    {project?._count && (
                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        <span>{project._count?.documents ?? 0} docs</span>
                        <span>{project._count?.incidents ?? 0} incidencias</span>
                        <span>{project._count?.workers ?? 0} trabajadores</span>
                      </div>
                    )}
                  </CardContent>
                </Link>
                {role === "ADMIN" && (
                  <button
                    onClick={(e: React.MouseEvent) => { e.preventDefault(); handleDelete(project?.id); }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </Card>
            </StaggerItem>
          )) ?? []}
        </Stagger>
      )}
    </div>
  );
}
