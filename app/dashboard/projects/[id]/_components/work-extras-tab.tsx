"use client";



import { useCallback, useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { DollarSign, Plus, Trash2, Check, X, FileText, Play, Loader2 } from "lucide-react";

import { toast } from "sonner";

import {

  ClientExtraApprovalDialog,

  approveWorkExtraWithConstancia,

  openConstancia,

} from "@/components/client/client-extra-approval-dialog";



const statusLabels: Record<string, string> = {

  BORRADOR: "Borrador",

  PENDIENTE_CLIENTE: "Pendiente su aprobacion",

  APROBADO: "Aprobado — puede ejecutarse",

  RECHAZADO: "Rechazado",

  EN_EJECUCION: "En ejecucion",

  COMPLETADO: "Completado",

};



const statusColors: Record<string, string> = {

  BORRADOR: "bg-gray-100 text-gray-800",

  PENDIENTE_CLIENTE: "bg-amber-100 text-amber-800",

  APROBADO: "bg-green-100 text-green-800",

  RECHAZADO: "bg-red-100 text-red-800",

  EN_EJECUCION: "bg-blue-100 text-blue-800",

  COMPLETADO: "bg-slate-100 text-slate-800",

};



function formatMoney(amount: number) {

  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);

}



export function WorkExtrasTab({ projectId, role }: { projectId: string; role: string }) {

  const [items, setItems] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [approveTarget, setApproveTarget] = useState<any | null>(null);

  const [busyId, setBusyId] = useState<string | null>(null);

  const [form, setForm] = useState({

    title: "",

    description: "",

    amount: "",

    status: "PENDIENTE_CLIENTE",

  });



  const fetchItems = useCallback(() => {

    setLoading(true);

    fetch(`/api/work-extras?projectId=${projectId}`)

      .then((r) => r.json())

      .then((data) => setItems(Array.isArray(data) ? data : []))

      .catch(console.error)

      .finally(() => setLoading(false));

  }, [projectId]);



  useEffect(() => {

    fetchItems();

  }, [fetchItems]);



  const handleCreate = async () => {

    if (!form.title || !form.amount) {

      toast.error("Titulo y monto son requeridos");

      return;

    }

    try {

      const res = await fetch("/api/work-extras", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          ...form,

          amount: parseFloat(form.amount),

          projectId,

          status: "PENDIENTE_CLIENTE",

        }),

      });

      if (!res.ok) throw new Error();

      toast.success("Adicional enviado al cliente — no ejecutar hasta su aprobacion");

      setDialogOpen(false);

      setForm({ title: "", description: "", amount: "", status: "PENDIENTE_CLIENTE" });

      fetchItems();

    } catch {

      toast.error("Error");

    }

  };



  const updateStatus = async (id: string, status: string) => {

    setBusyId(id);

    try {

      const res = await fetch(`/api/work-extras/${id}`, {

        method: "PUT",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ status }),

      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error);

      toast.success(

        status === "EN_EJECUCION"

          ? "Ejecucion iniciada"

          : status === "COMPLETADO"

            ? "Adicional completado"

            : "Estado actualizado"

      );

      fetchItems();

    } catch (e) {

      toast.error(e instanceof Error ? e.message : "Error");

    } finally {

      setBusyId(null);

    }

  };



  const handleClientApprove = async () => {

    if (!approveTarget) return;

    setBusyId(approveTarget.id);

    try {

      await approveWorkExtraWithConstancia(approveTarget.id);

      toast.success("Adicional aprobado — constancia generada");

      setApproveTarget(null);

      fetchItems();

    } catch (e) {

      toast.error(e instanceof Error ? e.message : "No se pudo aprobar");

    } finally {

      setBusyId(null);

    }

  };



  const handleDelete = async (id: string) => {

    if (!confirm("¿Eliminar este adicional?")) return;

    try {

      const res = await fetch(`/api/work-extras/${id}`, { method: "DELETE" });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error);

      toast.success("Eliminado");

      fetchItems();

    } catch (e) {

      toast.error(e instanceof Error ? e.message : "Error");

    }

  };



  const pendingTotal = items

    .filter((i) => i.status === "PENDIENTE_CLIENTE")

    .reduce((acc, i) => acc + Number(i.amount), 0);



  return (

    <>

      <Card>

        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          <div>

            <CardTitle className="text-lg font-display flex items-center gap-2">

              <DollarSign className="h-5 w-5 text-amber-600" />

              Adicionales de obra

            </CardTitle>

            <p className="text-xs text-muted-foreground mt-1">

              {role === "CLIENTE"

                ? "Debe aprobar cada adicional antes de que el proveedor lo ejecute. Al aprobar recibe una constancia con fecha y hora."

                : "Envie al cliente para aprobacion. No inicie la ejecucion hasta recibir el OK."}

            </p>

          </div>

          {role === "ADMIN" && (

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>

              <DialogTrigger asChild>

                <Button size="sm" className="bg-blue-800 hover:bg-blue-900">

                  <Plus className="mr-1 h-4 w-4" /> Nuevo adicional

                </Button>

              </DialogTrigger>

              <DialogContent>

                <DialogHeader>

                  <DialogTitle className="font-display">Registrar trabajo adicional</DialogTitle>

                </DialogHeader>

                <div className="space-y-4 mt-2">

                  <div className="space-y-2">

                    <Label>Descripcion del trabajo *</Label>

                    <Input

                      value={form.title}

                      onChange={(e) => setForm({ ...form, title: e.target.value })}

                      placeholder="Ej: Reparacion vereda, horas extra..."

                    />

                  </div>

                  <div className="space-y-2">

                    <Label>Detalle</Label>

                    <Textarea

                      value={form.description}

                      onChange={(e) => setForm({ ...form, description: e.target.value })}

                      rows={3}

                    />

                  </div>

                  <div className="space-y-2">

                    <Label>Monto (ARS) *</Label>

                    <Input

                      type="number"

                      min="0"

                      step="0.01"

                      value={form.amount}

                      onChange={(e) => setForm({ ...form, amount: e.target.value })}

                    />

                  </div>

                  <Button onClick={handleCreate} className="w-full bg-blue-800 hover:bg-blue-900">

                    Enviar a cliente para aprobacion

                  </Button>

                </div>

              </DialogContent>

            </Dialog>

          )}

        </CardHeader>

        <CardContent>

          {pendingTotal > 0 && role === "CLIENTE" && (

            <p className="text-sm mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">

              Tiene adicionales por <strong>{formatMoney(pendingTotal)}</strong> pendientes de su

              decision.

            </p>

          )}

          {loading ? (

            <div className="h-16 bg-muted animate-pulse rounded-lg" />

          ) : items.length === 0 ? (

            <p className="text-sm text-muted-foreground text-center py-8">

              No hay adicionales registrados

            </p>

          ) : (

            <ul className="space-y-2">

              {items.map((item) => (

                <li

                  key={item.id}

                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border"

                >

                  <div>

                    <div className="flex items-center gap-2 flex-wrap">

                      <span className="font-medium text-sm">{item.title}</span>

                      <Badge

                        className={`text-[10px] ${statusColors[item.status] ?? ""}`}

                        variant="secondary"

                      >

                        {statusLabels[item.status] ?? item.status}

                      </Badge>

                    </div>

                    {item.description && (

                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>

                    )}

                    <p className="text-sm font-mono font-semibold mt-1 text-amber-800">

                      {formatMoney(Number(item.amount))}

                    </p>

                    {item.approvalReference && (

                      <p className="text-[11px] text-muted-foreground mt-1">

                        Constancia: {item.approvalReference}

                        {item.approvedAt &&

                          ` · ${new Date(item.approvedAt).toLocaleString("es-AR")}`}

                      </p>

                    )}

                  </div>

                  <div className="flex items-center gap-1 shrink-0 flex-wrap">

                    {role === "CLIENTE" && item.status === "PENDIENTE_CLIENTE" && (

                      <>

                        <Button

                          size="sm"

                          className="bg-green-700 hover:bg-green-800"

                          onClick={() => setApproveTarget(item)}

                        >

                          <Check className="h-4 w-4 mr-1" /> Aprobar

                        </Button>

                        <Button

                          size="sm"

                          variant="outline"

                          className="text-destructive"

                          disabled={busyId === item.id}

                          onClick={() => updateStatus(item.id, "RECHAZADO")}

                        >

                          <X className="h-4 w-4 mr-1" /> Rechazar

                        </Button>

                      </>

                    )}

                    {(item.status === "APROBADO" ||

                      item.status === "EN_EJECUCION" ||

                      item.status === "COMPLETADO") &&

                      item.approvalReference && (

                        <Button

                          size="sm"

                          variant="outline"

                          onClick={() => openConstancia(item.id)}

                        >

                          <FileText className="h-4 w-4 mr-1" /> Constancia

                        </Button>

                      )}

                    {role === "ADMIN" && item.status === "APROBADO" && (

                      <Button

                        size="sm"

                        variant="outline"

                        disabled={busyId === item.id}

                        onClick={() => updateStatus(item.id, "EN_EJECUCION")}

                      >

                        {busyId === item.id ? (

                          <Loader2 className="h-4 w-4 animate-spin" />

                        ) : (

                          <>

                            <Play className="h-4 w-4 mr-1" /> Iniciar ejecucion

                          </>

                        )}

                      </Button>

                    )}

                    {role === "ADMIN" && item.status === "EN_EJECUCION" && (

                      <Button

                        size="sm"

                        variant="outline"

                        disabled={busyId === item.id}

                        onClick={() => updateStatus(item.id, "COMPLETADO")}

                      >

                        Marcar completado

                      </Button>

                    )}

                    {role === "ADMIN" && (

                      <Button

                        size="sm"

                        variant="ghost"

                        className="text-destructive"

                        onClick={() => handleDelete(item.id)}

                      >

                        <Trash2 className="h-4 w-4" />

                      </Button>

                    )}

                  </div>

                </li>

              ))}

            </ul>

          )}

        </CardContent>

      </Card>



      <ClientExtraApprovalDialog

        open={!!approveTarget}

        extra={approveTarget}

        busy={!!busyId}

        onOpenChange={(v) => !v && setApproveTarget(null)}

        onConfirm={handleClientApprove}

      />

    </>

  );

}


