"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, Download } from "lucide-react";
import { toast } from "sonner";
import { isAdmin, isSpecialist } from "@/lib/roles";

const phaseLabels: Record<string, string> = {
  ANTES: "Antes",
  DURANTE: "Durante",
  DESPUES: "Despues",
};

const phaseColors: Record<string, string> = {
  ANTES: "bg-slate-100 text-slate-800",
  DURANTE: "bg-amber-100 text-amber-900",
  DESPUES: "bg-green-100 text-green-800",
};

export function SiteLogTab({ projectId, role }: { projectId: string; role: string }) {
  const canUpload = isAdmin(role) || isSpecialist(role);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    phase: "DURANTE",
    title: "",
    notes: "",
  });

  const fetchEntries = useCallback(() => {
    setLoading(true);
    fetch(`/api/projects/${projectId}/site-log`)
      .then((r) => r.json())
      .then((d) => setEntries(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleCreate = async (file?: File) => {
    if (!form.title) {
      toast.error("Titulo requerido");
      return;
    }
    setUploading(true);
    try {
      let fileName: string | undefined;
      let cloudStoragePath: string | undefined;

      if (file) {
        const presignRes = await fetch("/api/upload/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: false }),
        });
        const { uploadUrl, cloud_storage_path } = await presignRes.json();
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!uploadRes.ok) throw new Error("upload");
        fileName = file.name;
        cloudStoragePath = cloud_storage_path;
      }

      const res = await fetch(`/api/projects/${projectId}/site-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          phase: form.phase,
          title: form.title,
          notes: form.notes || undefined,
          fileName,
          cloudStoragePath,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Registro de bitacora guardado");
      setDialogOpen(false);
      setForm({ phase: "DURANTE", title: "", notes: "" });
      fetchEntries();
    } catch {
      toast.error("Error al guardar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Bitacora fotografica
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Evidencia antes, durante y despues de la obra — visible para cliente y auditorias.
          </p>
        </div>
        {canUpload && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-800 hover:bg-blue-900">
                <Plus className="mr-1 h-4 w-4" /> Registro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo registro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Fase</Label>
                  <Select value={form.phase} onValueChange={(v) => setForm({ ...form, phase: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(phaseLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Titulo *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ej: Hormigonado losa, terminacion muro..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Foto (opcional)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    id="site-log-file"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCreate(f);
                    }}
                  />
                </div>
                <Button
                  onClick={() => handleCreate()}
                  disabled={uploading}
                  className="w-full bg-blue-800 hover:bg-blue-900"
                >
                  {uploading ? "Guardando..." : "Guardar sin foto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-20 bg-muted animate-pulse rounded-lg" />
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Sin registros. El proveedor documenta el avance con fotos por fase.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {entries.map((e) => (
              <div key={e.id} className="p-3 rounded-lg border space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge className={phaseColors[e.phase] ?? ""} variant="secondary">
                    {phaseLabels[e.phase] ?? e.phase}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString("es-AR")}
                  </span>
                </div>
                <p className="font-medium text-sm">{e.title}</p>
                {e.notes && <p className="text-xs text-muted-foreground">{e.notes}</p>}
                {e.uploadedBy?.name && (
                  <p className="text-[10px] text-muted-foreground">Por {e.uploadedBy.name}</p>
                )}
                {e.cloudStoragePath && (
                  <p className="text-xs flex items-center gap-1 text-blue-800">
                    <Download className="h-3 w-3" /> {e.fileName ?? "Adjunto"}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
