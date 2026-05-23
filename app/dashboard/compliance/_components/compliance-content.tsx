"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/animate";
import Link from "next/link";

async function uploadFile(file: File) {
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

export function ComplianceContent() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? "";
  const isAdmin = role === "ADMIN";
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ code: "", title: "", revision: "" });

  const fetchDocs = useCallback(() => {
    fetch("/api/organization/pac-documents")
      .then((r) => r.json())
      .then((d) => setDocs(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleUpload = async (file: File) => {
    if (!form.code || !form.title) {
      toast.error("Codigo y titulo requeridos");
      return;
    }
    try {
      const { fileName, cloudStoragePath } = await uploadFile(file);
      const res = await fetch("/api/organization/pac-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fileName,
          cloudStoragePath,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("PAC registrado");
      setDialogOpen(false);
      setForm({ code: "", title: "", revision: "" });
      fetchDocs();
    } catch {
      toast.error("Error");
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            Biblioteca PAC / SIGCE
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Procedimientos de calidad del tenant (PAC-EL, SIGCE-GE, POL-GAR-001). Vinculados a
            recepcion y garantia en cada obra.
          </p>
          <Link
            href="/dashboard"
            className="text-xs text-blue-800 hover:underline mt-2 inline-block"
          >
            Volver al centro de operaciones
          </Link>
        </div>
      </FadeIn>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-800" />
            Documentos de calidad
          </CardTitle>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-800 hover:bg-blue-900">
                  <Plus className="mr-1 h-4 w-4" /> Subir PAC
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo documento PAC</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Codigo *</Label>
                    <Input
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      placeholder="PAC-EL-003"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titulo *</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Revision</Label>
                    <Input
                      value={form.revision}
                      onChange={(e) => setForm({ ...form, revision: e.target.value })}
                      placeholder="Rev.3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Archivo PDF *</Label>
                    <Input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(f);
                      }}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-16 bg-muted animate-pulse rounded" />
          ) : docs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Sin PAC cargados. Suba PAC-EL-003, SIGCE-GE-001 y POL-GAR-001.
            </p>
          ) : (
            <ul className="space-y-2">
              {docs.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {d.code}
                      {d.revision ? ` · ${d.revision}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">{d.title}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    <Upload className="h-3 w-3 mr-1" />
                    {d.fileName}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
