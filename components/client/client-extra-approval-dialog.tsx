"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

type ExtraTarget = {
  id: string;
  title: string;
  amount: number | string;
  description?: string | null;
};

export function ClientExtraApprovalDialog({
  open,
  extra,
  busy,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  extra: ExtraTarget | null;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const [accepted, setAccepted] = useState(false);

  const amount = extra
    ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
        Number(extra.amount)
      )
    : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setAccepted(false);
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Aprobar trabajo adicional</DialogTitle>
          <DialogDescription>
            Al confirmar, autoriza al proveedor a ejecutar este trabajo por el monto indicado. Se
            generara una constancia con fecha y hora de su aprobacion.
          </DialogDescription>
        </DialogHeader>
        {extra && (
          <div className="space-y-3 text-sm border rounded-lg p-3 bg-muted/30">
            <p>
              <strong>{extra.title}</strong>
            </p>
            {extra.description && (
              <p className="text-muted-foreground">{extra.description}</p>
            )}
            <p className="text-lg font-semibold text-amber-800">{amount}</p>
          </div>
        )}
        <div className="flex items-start gap-2">
          <Checkbox
            id="accept-extra"
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
          />
          <Label htmlFor="accept-extra" className="text-sm leading-snug cursor-pointer">
            Confirmo que he revisado el presupuesto del adicional y autorizo su ejecucion por el
            monto indicado.
          </Label>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button
            className="bg-green-700 hover:bg-green-800"
            disabled={!accepted || busy}
            onClick={onConfirm}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aprobar y generar constancia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function openConstancia(extraId: string) {
  window.open(`/api/work-extras/${extraId}/constancia?print=1`, "_blank", "noopener,noreferrer");
}

export async function approveWorkExtraWithConstancia(extraId: string): Promise<boolean> {
  const res = await fetch(`/api/work-extras/${extraId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "APROBADO", acceptanceConfirmed: true }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "No se pudo aprobar");
  }
  openConstancia(extraId);
  return true;
}

export { openConstancia };
