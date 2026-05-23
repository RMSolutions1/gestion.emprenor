"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus } from "lucide-react";
import { toast } from "sonner";
import { isCliente } from "@/lib/roles";

const typeLabels: Record<string, string> = {
  PRESUPUESTO: "Presupuesto",
  ADICIONAL_AUTO: "Adicional aprobado",
  ADICIONAL: "Adicional manual",
  FACTURA: "Factura",
  PAGO: "Pago",
  AJUSTE: "Ajuste",
  NOTA_CREDITO: "Nota credito",
};

function formatMoney(n: number, currency: string) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(n);
}

export function ProjectLedgerTab({
  projectId,
  role,
}: {
  projectId: string;
  role: string;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    type: "PAGO",
    amount: "",
    description: "",
    reference: "",
  });
  const isAdmin = role === "ADMIN";
  const clientView = isCliente(role);

  const fetchLedger = useCallback(() => {
    setLoading(true);
    fetch(`/api/projects/${projectId}/ledger`)
      .then((r) => r.json())
      .then((d) => setData(d?.error ? null : d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleCreate = async () => {
    if (!form.amount || !form.description) {
      toast.error("Complete monto y descripcion");
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          type: form.type,
          amount: Number(form.amount),
          description: form.description,
          reference: form.reference || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Movimiento registrado");
      setDialogOpen(false);
      setForm({ type: "PAGO", amount: "", description: "", reference: "" });
      fetchLedger();
    } catch {
      toast.error("Error");
    }
  };

  const summary = data?.summary;
  const lines = data?.lines ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            {clientView ? "Presupuesto y cuenta corriente" : "Cuenta corriente de obra"}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {clientView
              ? "Vea el presupuesto acordado, adicionales aprobados, facturas emitidas y pagos registrados por Emprenor Servicios."
              : "Presupuesto, adicionales aprobados, facturas y pagos — saldo visible para el cliente."}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-800 hover:bg-blue-900">
                <Plus className="mr-1 h-4 w-4" /> Movimiento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar movimiento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAGO">Pago recibido</SelectItem>
                      <SelectItem value="FACTURA">Factura emitida</SelectItem>
                      <SelectItem value="AJUSTE">Ajuste</SelectItem>
                      <SelectItem value="NOTA_CREDITO">Nota de credito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monto (ARS)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripcion</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Referencia</Label>
                  <Input
                    value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                    placeholder="N° factura, transferencia..."
                  />
                </div>
                <Button onClick={handleCreate} className="w-full bg-blue-800 hover:bg-blue-900">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="h-20 bg-muted animate-pulse rounded-lg" />
        ) : (
          <>
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Presupuesto</p>
                  <p className="font-semibold text-sm">
                    {formatMoney(summary.budget, summary.currency)}
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Adicionales</p>
                  <p className="font-semibold text-sm">
                    {formatMoney(summary.extrasApproved, summary.currency)}
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <p className="text-[10px] text-muted-foreground uppercase">Cargos total</p>
                  <p className="font-semibold text-sm">
                    {formatMoney(summary.charges, summary.currency)}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50">
                  <p className="text-[10px] text-blue-800 uppercase">Saldo a cobrar</p>
                  <p className="font-bold text-base text-blue-900">
                    {formatMoney(summary.balance, summary.currency)}
                  </p>
                </div>
              </div>
            )}
            <ul className="space-y-2">
              {lines.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Sin movimientos. Defina presupuesto en Informacion o registre pagos.
                </p>
              ) : (
                lines.map((line: any) => (
                  <li
                    key={line.id}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border text-sm"
                  >
                    <div>
                      <p className="font-medium">{line.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeLabels[line.type] ?? line.type}
                        {line.reference ? ` · ${line.reference}` : ""}
                      </p>
                    </div>
                    <Badge variant={line.debit ? "secondary" : "outline"}>
                      {line.debit ? "+" : "-"}
                      {formatMoney(line.amount, line.currency)}
                    </Badge>
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
