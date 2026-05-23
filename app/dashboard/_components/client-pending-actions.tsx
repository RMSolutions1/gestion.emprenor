"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, X, FileCheck, DollarSign, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  ClientExtraApprovalDialog,
  approveWorkExtraWithConstancia,
} from "@/components/client/client-extra-approval-dialog";

export type PendingReport = {
  id: string;
  title: string;
  reportTypeLabel: string;
  projectId: string;
  projectName: string;
  description?: string | null;
};

export type PendingExtra = {
  id: string;
  title: string;
  amount: number;
  projectId: string;
  projectName: string;
  description?: string | null;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
}

export function ClientPendingActions({
  reports,
  extras,
  compact = false,
  onAction,
}: {
  reports: PendingReport[];
  extras: PendingExtra[];
  compact?: boolean;
  onAction?: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{
    type: "report" | "extra";
    id: string;
    title: string;
  } | null>(null);
  const [approveExtraTarget, setApproveExtraTarget] = useState<PendingExtra | null>(null);

  const total = reports.length + extras.length;
  if (total === 0) return null;

  const approveReport = async (id: string) => {
    setBusyId(`report-${id}`);
    try {
      const res = await fetch(`/api/technical-reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APROBADO" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Informe autorizado");
      onAction?.();
    } catch {
      toast.error("No se pudo autorizar");
    } finally {
      setBusyId(null);
    }
  };

  const approveExtra = async (id: string) => {
    const extra = extras.find((e) => e.id === id);
    if (extra) setApproveExtraTarget(extra);
  };

  const confirmApproveExtra = async () => {
    if (!approveExtraTarget) return;
    setBusyId(`extra-${approveExtraTarget.id}`);
    try {
      await approveWorkExtraWithConstancia(approveExtraTarget.id);
      toast.success("Adicional aprobado — constancia generada");
      setApproveExtraTarget(null);
      onAction?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo aprobar");
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    const { type, id } = rejectTarget;
    setBusyId(`${type}-${id}`);
    try {
      const url =
        type === "report" ? `/api/technical-reports/${id}` : `/api/work-extras/${id}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RECHAZADO" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Rechazado");
      onAction?.();
    } catch {
      toast.error("Error al rechazar");
    } finally {
      setBusyId(null);
      setRejectTarget(null);
    }
  };

  return (
    <>
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
        <CardHeader className={compact ? "pb-2" : undefined}>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
              <Check className="h-4 w-4 text-amber-800" />
            </span>
            Pendientes de su aprobacion
            <Badge className="bg-amber-600 text-white">{total}</Badge>
          </CardTitle>
          {!compact && (
            <p className="text-sm text-muted-foreground">
              Autorice con un clic informes, correcciones y trabajos adicionales de Emprenor.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border bg-white"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <FileCheck className="h-4 w-4 text-blue-700 shrink-0" />
                  <span className="font-medium text-sm">{r.title}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {r.reportTypeLabel}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{r.projectName}</p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button
                  size="sm"
                  className="bg-green-700 hover:bg-green-800"
                  disabled={!!busyId}
                  onClick={() => approveReport(r.id)}
                >
                  {busyId === `report-${r.id}` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Autorizar
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!busyId}
                  onClick={() => setRejectTarget({ type: "report", id: r.id, title: r.title })}
                >
                  <X className="h-4 w-4 mr-1" /> Rechazar
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/dashboard/projects/${r.projectId}?tab=reports`}>
                    Ver <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}

          {extras.map((e) => (
            <div
              key={e.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border bg-white"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <DollarSign className="h-4 w-4 text-amber-700 shrink-0" />
                  <span className="font-medium text-sm">{e.title}</span>
                  <span className="text-sm font-mono font-semibold text-amber-800">
                    {formatMoney(e.amount)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{e.projectName}</p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button
                  size="sm"
                  className="bg-green-700 hover:bg-green-800"
                  disabled={!!busyId}
                  onClick={() => approveExtra(e.id)}
                >
                  {busyId === `extra-${e.id}` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Aprobar
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!busyId}
                  onClick={() => setRejectTarget({ type: "extra", id: e.id, title: e.title })}
                >
                  <X className="h-4 w-4 mr-1" /> Rechazar
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/dashboard/projects/${e.projectId}?tab=extras`}>
                    Ver <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <AlertDialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Rechazar?</AlertDialogTitle>
            <AlertDialogDescription>
              Va a rechazar &quot;{rejectTarget?.title}&quot;. Emprenor sera notificado para
              revisar o corregir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmReject}
            >
              Rechazar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ClientExtraApprovalDialog
        open={!!approveExtraTarget}
        extra={approveExtraTarget}
        busy={!!busyId}
        onOpenChange={(v) => !v && setApproveExtraTarget(null)}
        onConfirm={confirmApproveExtra}
      />
    </>
  );
}
