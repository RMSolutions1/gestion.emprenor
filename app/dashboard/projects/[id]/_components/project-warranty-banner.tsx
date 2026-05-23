"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { WARRANTY_STATUS_LABELS, type WarrantyStatus } from "@/lib/warranty";

export function ProjectWarrantyBanner({
  projectId,
  role,
}: {
  projectId: string;
  role: string;
}) {
  const [info, setInfo] = useState<{
    status: WarrantyStatus;
    daysRemaining: number | null;
    warrantyDays: number;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/reception`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setInfo({ status: d.status, daysRemaining: d.daysRemaining, warrantyDays: d.warrantyDays });
      })
      .catch(() => {});
  }, [projectId]);

  if (!info || info.status === "SIN_RECEPCION") return null;

  const isUrgent =
    info.status === "LISTA_RECEPCION" ||
    (info.status === "VIGENTE" && info.daysRemaining != null && info.daysRemaining <= 15);

  if (!isUrgent && info.status !== "VIGENTE") return null;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border text-sm ${
        info.status === "LISTA_RECEPCION"
          ? "bg-amber-50 border-amber-200"
          : "bg-green-50 border-green-200"
      }`}
    >
      <div className="flex items-start gap-2">
        {info.status === "LISTA_RECEPCION" ? (
          <AlertCircle className="h-5 w-5 text-amber-700 shrink-0" />
        ) : (
          <ShieldCheck className="h-5 w-5 text-green-700 shrink-0" />
        )}
        <div>
          <p className="font-medium">
            {WARRANTY_STATUS_LABELS[info.status]}
          </p>
          {info.status === "VIGENTE" && info.daysRemaining != null && (
            <p className="text-muted-foreground text-xs mt-0.5">
              Garantía POL-GAR-001: {info.daysRemaining} días restantes (mín. {info.warrantyDays} días)
            </p>
          )}
          {info.status === "LISTA_RECEPCION" && role === "CLIENTE" && (
            <p className="text-muted-foreground text-xs mt-0.5">
              Confirme la recepción para activar {info.warrantyDays} días de garantía de servicio.
            </p>
          )}
        </div>
      </div>
      <Link
        href={`/dashboard/projects/${projectId}?tab=reception`}
        className="text-xs font-medium text-primary hover:underline shrink-0"
      >
        Ver recepción y garantía →
      </Link>
    </div>
  );
}
