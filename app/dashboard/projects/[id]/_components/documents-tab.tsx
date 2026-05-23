"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  File,
  FolderOpen,
  History,
  GitBranch,
  PenLine,
  ScanText,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { isCliente } from "@/lib/roles";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  PLANOS: "Planos de obra",
  FACTURAS: "Facturas",
  REMITOS: "Remitos",
  ORDENES_TRABAJO: "Ordenes de trabajo",
  PROCEDIMIENTOS: "Procedimientos",
  ART: "ART",
  SEGUROS: "Seguros",
  LEGAJO_PERSONAL: "Legajo personal",
  VEHICULO: "Documentacion vehiculo",
  ADICIONAL_OBRA: "Adicional de obra",
  ANTECEDENTES: "Antecedentes",
  LISTA_MATERIALES: "Lista de materiales",
  INFORME_TECNICO: "Informe tecnico",
  CONFORMIDAD: "Conformidad / acta",
  OTROS: "Otros",
};

const categoryColors: Record<string, string> = {
  PLANOS: "bg-blue-100 text-blue-800",
  FACTURAS: "bg-green-100 text-green-800",
  REMITOS: "bg-purple-100 text-purple-800",
  ORDENES_TRABAJO: "bg-orange-100 text-orange-800",
  PROCEDIMIENTOS: "bg-teal-100 text-teal-800",
  ART: "bg-red-100 text-red-800",
  SEGUROS: "bg-yellow-100 text-yellow-800",
  LEGAJO_PERSONAL: "bg-slate-100 text-slate-800",
  VEHICULO: "bg-cyan-100 text-cyan-800",
  ADICIONAL_OBRA: "bg-amber-100 text-amber-800",
  OTROS: "bg-gray-100 text-gray-800",
  INFORME_TECNICO: "bg-indigo-100 text-indigo-800",
  CONFORMIDAD: "bg-emerald-100 text-emerald-800",
  ANTECEDENTES: "bg-slate-100 text-slate-800",
  LISTA_MATERIALES: "bg-violet-100 text-violet-800",
};

type ClientDocGroup = "ALL" | "PLANOS" | "COMERCIAL" | "LEGALES" | "INFORMES";

const CLIENT_GROUP_CATEGORIES: Record<Exclude<ClientDocGroup, "ALL">, string[]> = {
  PLANOS: ["PLANOS"],
  COMERCIAL: ["FACTURAS", "REMITOS", "LISTA_MATERIALES", "ADICIONAL_OBRA", "CONFORMIDAD"],
  LEGALES: ["ART", "SEGUROS", "LEGAJO_PERSONAL", "ANTECEDENTES", "PROCEDIMIENTOS", "VEHICULO"],
  INFORMES: ["INFORME_TECNICO", "ORDENES_TRABAJO", "OTROS"],
};

const CLIENT_GROUP_LABELS: Record<ClientDocGroup, string> = {
  ALL: "Todo el legajo",
  PLANOS: "Planos",
  COMERCIAL: "Facturas y remitos",
  LEGALES: "Seguros y legajo",
  INFORMES: "Informes y otros",
};

export function DocumentsTab({ projectId, role }: { projectId: string; role: string }) {
  const clientMode = isCliente(role);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [category, setCategory] = useState("PLANOS");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [clientGroup, setClientGroup] = useState<ClientDocGroup>("PLANOS");
  const [historyDoc, setHistoryDoc] = useState<any | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versionUploading, setVersionUploading] = useState(false);
  const [changeNote, setChangeNote] = useState("");

  const fetchDocs = useCallback(() => {
    fetch(`/api/documents?projectId=${projectId}`)
      .then((r) => r.json())
      .then((data: any) => setDocuments(Array.isArray(data) ? data : []))
      .catch((e: any) => console.error(e))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Get presigned URL
      const presignRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: false }),
      });
      const { uploadUrl, cloud_storage_path } = await presignRes.json();

      // Check if content-disposition is in signed headers
      const urlObj = new URL(uploadUrl);
      const signedHeaders = urlObj?.searchParams?.get?.("X-Amz-SignedHeaders") ?? "";
      const headers: Record<string, string> = { "Content-Type": file.type };
      if (signedHeaders?.includes?.("content-disposition")) {
        headers["Content-Disposition"] = "attachment";
      }

      // Upload to S3
      const uploadRes = await fetch(uploadUrl, { method: "PUT", headers, body: file });
      if (!uploadRes.ok) throw new Error("Upload failed");

      // Save document record
      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          cloudStoragePath: cloud_storage_path,
          isPublic: false,
          category,
          projectId,
        }),
      });

      toast.success("Documento subido correctamente");
      setDialogOpen(false);
      fetchDocs();
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Error al subir documento");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const res = await fetch(`/api/documents/download?id=${docId}`);
      const data = await res.json();
      if (data?.url) {
        const a = document.createElement("a");
        a.href = data.url;
        a.download = fileName ?? "archivo";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Error al descargar");
    }
  };

  const openHistory = async (doc: any) => {
    setHistoryDoc(doc);
    setHistoryOpen(true);
    setChangeNote("");
    try {
      const res = await fetch(`/api/documents/${doc.id}/versions`);
      const data = await res.json();
      setVersions(data.versions ?? []);
    } catch {
      toast.error("No se pudo cargar el historial");
    }
  };

  const handleNewVersion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !historyDoc) return;
    setVersionUploading(true);
    try {
      const presignRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: false }),
      });
      const { uploadUrl, cloud_storage_path } = await presignRes.json();
      const headers: Record<string, string> = { "Content-Type": file.type };
      const uploadRes = await fetch(uploadUrl, { method: "PUT", headers, body: file });
      if (!uploadRes.ok) throw new Error("Upload failed");

      const res = await fetch(`/api/documents/${historyDoc.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          cloudStoragePath: cloud_storage_path,
          changeNote: changeNote || undefined,
        }),
      });
      if (!res.ok) throw new Error("Error al versionar");
      toast.success(`Nueva version v${(historyDoc.version ?? 1) + 1}`);
      setHistoryOpen(false);
      fetchDocs();
    } catch {
      toast.error("Error al subir nueva version");
    } finally {
      setVersionUploading(false);
    }
  };

  const handleSign = async (doc: any) => {
    if (!confirm(`Firmar digitalmente "${doc.fileName}"?`)) return;
    try {
      const res = await fetch(`/api/documents/${doc.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureNote: "Conformidad en plataforma Emprenor Nexus" }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      toast.success("Documento firmado");
      fetchDocs();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al firmar");
    }
  };

  const handleOcr = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/ocr`, { method: "POST" });
      if (!res.ok) throw new Error("OCR fallo");
      toast.success("Metadatos extraidos (OCR completo requiere AWS Textract)");
      fetchDocs();
    } catch {
      toast.error("Error en OCR");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("\u00bfEliminar este documento?")) return;
    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      toast.success("Documento eliminado");
      fetchDocs();
    } catch (e: any) {
      console.error(e);
      toast.error("Error");
    }
  };

  const sorted = [...documents].sort((a, b) => {
    if (clientMode) {
      if (a.category === "PLANOS" && b.category !== "PLANOS") return -1;
      if (b.category === "PLANOS" && a.category !== "PLANOS") return 1;
    }
    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
  });

  const filtered = sorted.filter((d: any) => {
    if (clientMode) {
      if (clientGroup === "ALL") return true;
      return CLIENT_GROUP_CATEGORIES[clientGroup]?.includes(d?.category);
    }
    if (filterCategory === "ALL") return true;
    return d?.category === filterCategory;
  });

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {clientMode ? "Documentacion de la obra" : "Documentos"}
        </CardTitle>
        <div className="flex flex-col gap-2 sm:items-end">
        {clientMode && (
          <p className="text-xs text-muted-foreground max-w-md text-left sm:text-right">
            Documentacion de la obra: planos, facturas, remitos, informes y conformidades. El legajo
            de empleados (ART, seguros) esta en Personal. Presupuesto y saldo en Presupuesto y cobros.
            Consultas en Consultas y justificaciones.
          </p>
        )}
        {clientMode && (
          <div className="flex flex-wrap gap-1.5 justify-start sm:justify-end">
            {(Object.keys(CLIENT_GROUP_LABELS) as ClientDocGroup[]).map((g) => (
              <Button
                key={g}
                type="button"
                size="sm"
                variant={clientGroup === g ? "default" : "outline"}
                className={cn(
                  "h-8 text-xs",
                  clientGroup === g && "bg-emprenor hover:bg-emprenor-light"
                )}
                onClick={() => setClientGroup(g)}
              >
                {CLIENT_GROUP_LABELS[g]}
              </Button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          {!clientMode && (
          <Select value={filterCategory} onValueChange={(v: string) => setFilterCategory(v)}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las categorias</SelectItem>
              {Object.entries(categoryLabels)?.map?.(([k, v]: [string, string]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          )}
          {role === "ADMIN" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-800 hover:bg-blue-900">
                  <Upload className="mr-1 h-4 w-4" /> Subir
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Subir Documento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={category} onValueChange={(v: string) => setCategory(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels)?.map?.(([k, v]: [string, string]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Archivo</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <input
                        type="file"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      {uploading && <p className="text-sm text-muted-foreground mt-2">Subiendo...</p>}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3]?.map?.((i: number) => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : (filtered?.length ?? 0) === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No hay documentos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered?.map?.((doc: any) => (
              <div key={doc?.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc?.fileName ?? "Archivo"}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc?.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("es-AR") : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${categoryColors?.[doc?.category] ?? ''}`} variant="secondary">
                    {categoryLabels?.[doc?.category] ?? doc?.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] gap-0.5">
                    <GitBranch className="h-3 w-3" /> v{doc?.version ?? 1}
                  </Badge>
                  {doc?.signedAt && (
                    <Badge className="text-[10px] gap-0.5 bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3" /> Firmado
                    </Badge>
                  )}
                  {doc?.ocrStatus === "COMPLETED" && (
                    <Badge variant="outline" className="text-[10px]">OCR</Badge>
                  )}
                  {role === "ADMIN" && !doc?.signedAt && (
                    <Button size="sm" variant="ghost" onClick={() => handleSign(doc)} title="Firma digital">
                      <PenLine className="h-4 w-4" />
                    </Button>
                  )}
                  {role === "ADMIN" && doc?.ocrStatus !== "COMPLETED" && (
                    <Button size="sm" variant="ghost" onClick={() => handleOcr(doc?.id)} title="Ejecutar OCR">
                      <ScanText className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openHistory(doc)} title="Historial">
                    <History className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(doc?.id, doc?.fileName)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {role === "ADMIN" && (
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(doc?.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )) ?? []}
          </div>
        )}
      </CardContent>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de versiones
            </DialogTitle>
          </DialogHeader>
          {historyDoc && (
            <div className="space-y-4 mt-2">
              <p className="text-sm font-medium truncate">{historyDoc.fileName}</p>
              <p className="text-xs text-muted-foreground">
                Version actual: <strong>v{historyDoc.version ?? 1}</strong>
              </p>
              <ul className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
                {versions.length === 0 ? (
                  <li className="text-xs text-muted-foreground p-2">Sin versiones anteriores archivadas.</li>
                ) : (
                  versions.map((v: any) => (
                    <li key={v.id} className="text-xs border-b pb-2 last:border-0">
                      <span className="font-medium">v{v.versionNumber}</span> — {v.fileName}
                      <br />
                      <span className="text-muted-foreground">
                        {new Date(v.uploadedAt).toLocaleString("es-AR")}
                        {v.uploadedBy?.name ? ` · ${v.uploadedBy.name}` : ""}
                      </span>
                      {v.changeNote && (
                        <p className="text-muted-foreground mt-0.5">{v.changeNote}</p>
                      )}
                    </li>
                  ))
                )}
              </ul>
              {historyDoc?.ocrText && (
                <div className="rounded border p-2 bg-muted/40 max-h-32 overflow-y-auto">
                  <p className="text-[10px] font-medium mb-1">Texto OCR</p>
                  <pre className="text-[10px] whitespace-pre-wrap text-muted-foreground">{historyDoc.ocrText}</pre>
                </div>
              )}
              {historyDoc?.signedAt && historyDoc?.signatureNote && (
                <p className="text-xs text-green-700 border border-green-200 rounded p-2">
                  Firmado: {new Date(historyDoc.signedAt).toLocaleString("es-AR")}
                  <br />
                  {historyDoc.signatureNote}
                </p>
              )}
              {role === "ADMIN" && (
                <div className="space-y-2 border-t pt-3">
                  <Label>Nota de cambio (opcional)</Label>
                  <Input value={changeNote} onChange={(e) => setChangeNote(e.target.value)} placeholder="Ej: Plano actualizado segun revision cliente" />
                  <Label>Subir nueva version</Label>
                  <input
                    type="file"
                    disabled={versionUploading}
                    onChange={handleNewVersion}
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700"
                  />
                  {versionUploading && <p className="text-xs text-muted-foreground">Subiendo...</p>}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
