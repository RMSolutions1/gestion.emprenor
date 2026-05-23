"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { isAdmin, isCliente } from "@/lib/roles";
import {
  WARRANTY_STATUS_LABELS,
  type WarrantyStatus,
} from "@/lib/warranty";

type ReceptionData = {
  status: WarrantyStatus;
  receptionReadyAt: string | null;
  receptionAt: string | null;
  receptionReference: string | null;
  warrantyDays: number;
  warrantyStartAt: string | null;
  warrantyEndAt: string | null;
  daysRemaining: number | null;
  pendingExtras: { id: string; title: string }[];
  policyCode: string;
  minWarrantyDays: number;
};

const statusBadge: Record<WarrantyStatus, string> = {
  SIN_RECEPCION: "bg-slate-100 text-slate-800",
  LISTA_RECEPCION: "bg-amber-100 text-amber-800",
  VIGENTE: "bg-green-100 text-green-800",
  VENCIDA: "bg-gray-100 text-gray-700",
};

export function ProjectReceptionTab({
  projectId,
  role,
  onUpdate,
}: {
  projectId: string;
  role: string;
  onUpdate?: () => void;
}) {
  const [data, setData] = useState<ReceptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [notes, setNotes] = useState("");

  const load = useCallback(() => {
    fetch(`/api/projects/${projectId}/reception`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.error) setData(json);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const markReady = async (ready: boolean) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/reception`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receptionReady: ready }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(ready ? "Obra habilitada para recepción del cliente" : "Recepción deshabilitada");
      load();
      onUpdate?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  const confirmReception = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/reception`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmReception: true,
          acceptanceConfirmed: true,
          receptionNotes: notes || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`Recepción registrada — garantía ${json.warrantyDays} días`);
      window.open(`/api/projects/${projectId}/reception/certificado?print=1`, "_blank");
      setAccepted(false);
      load();
      onUpdate?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="h-32 bg-muted animate-pulse rounded-xl" />;
  }

  if (!data) return null;

  const status = data.status;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-700" />
            Recepción final y garantía de servicio
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Marco {data.policyCode} · CONF-EL-001 (PAC-EL-003 §13). Garantía mínima{" "}
            <strong>{data.minWarrantyDays} días</strong> desde su conformidad.
          </p>
          <Badge className={`w-fit ${statusBadge[status]}`}>
            {WARRANTY_STATUS_LABELS[status]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "VIGENTE" && data.warrantyEndAt && (
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-sm">
              <p className="flex items-center gap-2 font-medium text-green-900">
                <CheckCircle2 className="h-4 w-4" />
                Garantía vigente
              </p>
              <p className="mt-1 text-green-800">
                Referencia: <strong>{data.receptionReference}</strong>
              </p>
              <p className="text-green-800 flex items-center gap-1 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                Vence el {new Date(data.warrantyEndAt).toLocaleDateString("es-AR")} —{" "}
                <strong>{data.daysRemaining ?? 0} días restantes</strong>
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() =>
                  window.open(`/api/projects/${projectId}/reception/certificado?print=1`, "_blank")
                }
              >
                <FileText className="h-4 w-4 mr-1" /> Descargar certificado CONF-EL
              </Button>
            </div>
          )}

          {status === "VENCIDA" && (
            <p className="text-sm text-muted-foreground p-3 border rounded-lg">
              La garantía de {data.warrantyDays} días finalizó el{" "}
              {data.warrantyEndAt && new Date(data.warrantyEndAt).toLocaleDateString("es-AR")}.
              Los registros QA/QC se conservan según PAC (10 años).
            </p>
          )}

          {data.pendingExtras.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm flex gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Adicionales pendientes</p>
                <ul className="list-disc ml-4 mt-1 text-amber-800">
                  {data.pendingExtras.map((e) => (
                    <li key={e.id}>{e.title}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {isAdmin(role) && !data.receptionAt && (
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={busy}
                onClick={() => markReady(true)}
                className="bg-blue-800 hover:bg-blue-900"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Habilitar recepción para el cliente"}
              </Button>
              {data.receptionReadyAt && (
                <Button variant="outline" disabled={busy} onClick={() => markReady(false)}>
                  Revocar habilitación
                </Button>
              )}
            </div>
          )}

          {isCliente(role) && status === "LISTA_RECEPCION" && (
            <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
              <p className="text-sm">
                El proveedor indicó que la obra está lista. Al confirmar, inicia la garantía de{" "}
                {data.minWarrantyDays} días y se genera el certificado CONF-EL-001.
              </p>
              <Textarea
                placeholder="Observaciones opcionales de recepción..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
              <div className="flex items-start gap-2">
                <Checkbox
                  id="accept-reception"
                  checked={accepted}
                  onCheckedChange={(v) => setAccepted(v === true)}
                />
                <Label htmlFor="accept-reception" className="text-sm leading-snug cursor-pointer">
                  Confirmo que recibí conforme la obra/servicio ejecutado y acepto el inicio de la
                  garantía mínima de {data.minWarrantyDays} días según POL-GAR-001.
                </Label>
              </div>
              <Button
                className="bg-green-700 hover:bg-green-800"
                disabled={!accepted || busy || data.pendingExtras.length > 0}
                onClick={confirmReception}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirmar recepción y generar certificado"
                )}
              </Button>
            </div>
          )}

          {isCliente(role) && status === "SIN_RECEPCION" && (
            <p className="text-sm text-muted-foreground">
              Cuando el proveedor habilite la recepción final, podrá confirmarla aquí y activar su
              garantía de servicio.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
