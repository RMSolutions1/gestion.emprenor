"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type BillingData = {
  organization: {
    name: string;
    plan: string;
    status: string;
    trialEndsAt: string | null;
    stripeCustomerId: string | null;
  };
  planConfig: { name: string; priceLabel: string; description: string };
  plans: { plan: string; name: string; priceLabel: string; description: string }[];
  stripeConfigured: boolean;
  trialActive: boolean;
  trialDaysLeft: number;
};

export function BillingContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/billing/status")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(() => toast.error("No se pudo cargar facturacion"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    if (searchParams.get("success")) toast.success("Suscripcion actualizada");
    if (searchParams.get("checkout") === "mock") toast.info("Modo demo: plan activado sin Stripe");
  }, [load, searchParams]);

  const startCheckout = async (plan: string) => {
    setCheckoutPlan(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (json.url) window.location.href = json.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setCheckoutPlan(null);
    }
  };

  const openPortal = async () => {
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      if (json.url) window.location.href = json.url;
    } catch {
      toast.error("Portal no disponible");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) return null;

  const { organization, trialActive, trialDaysLeft, stripeConfigured } = data;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-blue-600" />
          Facturacion y plan
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tu suscripcion Emprenor Nexus
          {!stripeConfigured && " (modo demo sin Stripe configurado)"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{organization.name}</CardTitle>
          <CardDescription>Estado de la cuenta</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 items-center">
          <Badge variant="secondary">Plan {data.planConfig.name}</Badge>
          <Badge
            className={cn(
              organization.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
            )}
          >
            {organization.status}
          </Badge>
          {trialActive && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Trial: {trialDaysLeft} dias restantes
            </span>
          )}
          {organization.stripeCustomerId && (
            <Button variant="outline" size="sm" onClick={openPortal}>
              Portal de pagos
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        {data.plans.map((p) => {
          const current = organization.plan === p.plan;
          return (
            <Card
              key={p.plan}
              className={cn(current && "ring-2 ring-blue-600 border-blue-200")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {p.name}
                  {current && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                </CardTitle>
                <p className="text-2xl font-mono font-bold">{p.priceLabel}</p>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">{p.description}</p>
                <Button
                  className="w-full bg-blue-800 hover:bg-blue-900"
                  size="sm"
                  disabled={current || checkoutPlan === p.plan || p.plan === "ENTERPRISE"}
                  onClick={() => startCheckout(p.plan)}
                >
                  {checkoutPlan === p.plan ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : current ? (
                    "Plan actual"
                  ) : p.plan === "ENTERPRISE" ? (
                    "Contactar ventas"
                  ) : (
                    "Activar plan"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

