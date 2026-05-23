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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Plus, Trash2, Upload, Download, FileText } from "lucide-react";
import { toast } from "sonner";

const categoryLabels: Record<string, string> = {
  HERRAMIENTA: "Herramienta",
  MATERIAL: "Material",
  EPP: "EPP",
  EQUIPO: "Equipo",
  OTRO: "Otro",
};

const deliveryLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PARCIAL: "Parcial",
  ENTREGADO: "Entregado",
};

const docTypeOptions = [
  { value: "REMITOS", label: "Remito" },
  { value: "FACTURAS", label: "Factura" },
  { value: "OTROS", label: "Certificado / otro" },
];

const emptyForm = {
  itemName: "",
  quantity: "",
  unit: "unidad",
  category: "MATERIAL",
  supplier: "",
  brand: "",
  deliveryStatus: "PENDIENTE",
  notes: "",
};

async function uploadFile(file: File): Promise<{ fileName: string; cloudStoragePath: string }> {
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
  return { fileName: file.name, cloudStoragePath: cloud_storage_path };
}

export function MaterialsTab({ projectId, role }: { projectId: string; role: string }) {
  const isAdmin = role === "ADMIN";
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchItems = useCallback(() => {
    setLoading(true);
    fetch(`/api/materials?projectId=${projectId}`)
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreate = async () => {
    if (!form.itemName) {
      toast.error("Nombre requerido");
      return;
    }
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, projectId }),
      });
      if (!res.ok) throw new Error();
      toast.success("Item agregado");
      setDialogOpen(false);
      setForm(emptyForm);
      fetchItems();
    } catch {
      toast.error("Error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar de la lista?")) return;
    try {
      await fetch(`/api/materials/${id}`, { method: "DELETE" });
      toast.success("Eliminado");
      fetchItems();
    } catch {
      toast.error("Error");
    }
  };

  const attachDoc = async (materialId: string, file: File, category: string) => {
    try {
      const { fileName, cloudStoragePath } = await uploadFile(file);
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          cloudStoragePath,
          category,
          projectId,
          projectMaterialId: materialId,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Documento vinculado al material");
      fetchItems();
    } catch {
      toast.error("Error al subir");
    }
  };

  const exportCsv = () => {
    window.open(`/api/materials/export?projectId=${projectId}`, "_blank");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
        <div>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Materiales y trazabilidad
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Remito, factura y certificado por linea — requisito en barrios privados e industria.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="mr-1 h-4 w-4" /> Exportar CSV
          </Button>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-800 hover:bg-blue-900">
                  <Plus className="mr-1 h-4 w-4" /> Agregar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Agregar material / herramienta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Descripcion *</Label>
                    <Input
                      value={form.itemName}
                      onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unidad</Label>
                      <Input
                        value={form.unit}
                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Proveedor</Label>
                      <Input
                        value={form.supplier}
                        onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Marca</Label>
                      <Input
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleCreate} className="w-full bg-blue-800 hover:bg-blue-900">
                    Guardar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-16 bg-muted animate-pulse rounded-lg" />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Cargue materiales con proveedor y documentacion de entrega
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="p-4 rounded-lg border space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity ? `${item.quantity} ${item.unit ?? ""}` : "—"}
                      {item.supplier ? ` · ${item.supplier}` : ""}
                      {item.brand ? ` · ${item.brand}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    <Badge variant="secondary" className="text-[10px]">
                      {deliveryLabels[item.deliveryStatus] ?? item.deliveryStatus}
                    </Badge>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive h-8 w-8 p-0"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {(item.documents?.length ?? 0) > 0 ? (
                  <ul className="text-xs space-y-1 pl-2 border-l-2 border-blue-100">
                    {item.documents.map((d: any) => (
                      <li key={d.id} className="flex items-center gap-1 text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        {d.fileName} ({d.category})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[10px] text-amber-700">Sin remito/factura adjunto</p>
                )}
                {isAdmin && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {docTypeOptions.map((opt) => (
                      <label key={opt.value} className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) attachDoc(item.id, f, opt.value);
                            e.target.value = "";
                          }}
                        />
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded border hover:bg-muted">
                          <Upload className="h-3 w-3" /> {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
