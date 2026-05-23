"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { BILLING_PLANS } from "@/lib/billing-plans";

export function RegisterTenantForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    industry: "Construccion",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    plan: "PROFESSIONAL",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al registrar");
      toast.success("Empresa creada. Trial activo.");
      router.push(`/login?registered=1&email=${encodeURIComponent(form.adminEmail)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2 text-xl">
          <Building2 className="h-6 w-6 text-blue-600" />
          Alta de empresa
        </CardTitle>
        <CardDescription>
          Crea tu tenant en minutos. Incluye canal corporativo, trial y panel admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre de la empresa</Label>
            <Input
              required
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="Ej: Constructora del Sur S.A."
            />
          </div>
          <div className="space-y-2">
            <Label>Industria</Label>
            <Input
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Plan inicial</Label>
            <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BILLING_PLANS.map((p) => (
                  <SelectItem key={p.plan} value={p.plan}>
                    {p.name} — {p.priceLabel}/mes (trial {p.trialDays}d)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-t pt-4 space-y-2">
            <Label>Administrador principal</Label>
            <Input
              required
              value={form.adminName}
              onChange={(e) => setForm({ ...form, adminName: e.target.value })}
              placeholder="Nombre y apellido"
            />
          </div>
          <div className="space-y-2">
            <Label>Email corporativo</Label>
            <Input
              type="email"
              required
              value={form.adminEmail}
              onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Contrasena (min. 8 caracteres)</Label>
            <Input
              type="password"
              required
              minLength={8}
              value={form.adminPassword}
              onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-900" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Crear cuenta empresa <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Ya tenes cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Ingresar
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
