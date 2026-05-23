"use client";

import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import type { ClientEntityType } from "@prisma/client";
import {
  CLIENT_ENTITY_LABELS,
  type ClientProfileDTO,
  computeProfileCompleteness,
} from "@/lib/client-profile";

const empty: ClientProfileDTO = {
  userId: "",
  entityType: "EMPRESA",
  legalName: null,
  taxId: null,
  phone: null,
  mobilePhone: null,
  contactRole: null,
  billingAddress: null,
  city: null,
  province: null,
  postalCode: null,
  country: "AR",
  sector: null,
  notes: null,
};

export function ClientProfileForm({
  userId,
  initial,
  showAdminNotes = false,
  onSaved,
}: {
  userId: string;
  initial: ClientProfileDTO | null;
  showAdminNotes?: boolean;
  onSaved?: () => void;
}) {
  const [form, setForm] = useState<ClientProfileDTO>({ ...empty, ...initial, userId });
  const [saving, setSaving] = useState(false);
  const completeness = computeProfileCompleteness(form);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}/client-profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Ficha de cliente actualizada");
      onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="flex justify-between text-xs mb-2">
          <span className="font-medium text-emprenor">Completitud de ficha</span>
          <span className="text-muted-foreground">{completeness.percent}%</span>
        </div>
        <Progress value={completeness.percent} className="h-2" />
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          Cuanto mas completa la ficha del cliente, mejor: facturacion, consultas, legajo y
          auditoria del mandante.
        </p>
        {completeness.percent < 80 && completeness.missing.length > 0 && (
          <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">
            Falta: {completeness.missing.slice(0, 4).join(", ")}
            {completeness.missing.length > 4 ? "…" : ""}
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2 sm:col-span-2">
          <Label>Tipo de cliente</Label>
          <Select
            value={form.entityType}
            onValueChange={(v) => setForm({ ...form, entityType: v as ClientEntityType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(CLIENT_ENTITY_LABELS) as [string, string][]).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Razon social / nombre legal</Label>
          <Input
            value={form.legalName ?? ""}
            onChange={(e) => setForm({ ...form, legalName: e.target.value || null })}
          />
        </div>
        <div className="space-y-2">
          <Label>CUIT / ID fiscal</Label>
          <Input
            value={form.taxId ?? ""}
            onChange={(e) => setForm({ ...form, taxId: e.target.value || null })}
          />
        </div>
        <div className="space-y-2">
          <Label>Rubro / sector</Label>
          <Input
            value={form.sector ?? ""}
            onChange={(e) => setForm({ ...form, sector: e.target.value || null })}
            placeholder="Ej: Farmacia, industria, consorcio"
          />
        </div>
        <div className="space-y-2">
          <Label>Telefono</Label>
          <Input
            value={form.phone ?? ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value || null })}
          />
        </div>
        <div className="space-y-2">
          <Label>Celular</Label>
          <Input
            value={form.mobilePhone ?? ""}
            onChange={(e) => setForm({ ...form, mobilePhone: e.target.value || null })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Cargo o area de contacto</Label>
          <Input
            value={form.contactRole ?? ""}
            onChange={(e) => setForm({ ...form, contactRole: e.target.value || null })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Direccion fiscal / de contacto</Label>
          <Input
            value={form.billingAddress ?? ""}
            onChange={(e) => setForm({ ...form, billingAddress: e.target.value || null })}
          />
        </div>
        <div className="space-y-2">
          <Label>Ciudad</Label>
          <Input
            value={form.city ?? ""}
            onChange={(e) => setForm({ ...form, city: e.target.value || null })}
          />
        </div>
        <div className="space-y-2">
          <Label>Provincia</Label>
          <Input
            value={form.province ?? ""}
            onChange={(e) => setForm({ ...form, province: e.target.value || null })}
          />
        </div>
        {showAdminNotes && (
          <div className="space-y-2 sm:col-span-2">
            <Label>Notas internas (solo proveedor)</Label>
            <Textarea
              rows={3}
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
            />
          </div>
        )}
      </div>

      <Button
        className="w-full bg-emprenor hover:bg-emprenor-light"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Guardando…" : "Guardar ficha"}
      </Button>
    </div>
  );
}
