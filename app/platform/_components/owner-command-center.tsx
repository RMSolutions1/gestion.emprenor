"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  DollarSign,
  Activity,
  Globe2,
  Server,
  Shield,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { signOut } from "next-auth/react";

type PlatformStats = {
  kpis: {
    tenants: number;
    activeTenants: number;
    users: number;
    projects: number;
    mrr: number;
    arr: number;
    uptime: number;
    auditEvents24h: number;
    churnRate: number;
  };
  tenants: Array<{
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: string;
    users: number;
    projects: number;
  }>;
  system: {
    apiLatencyMs: number;
    storageUsedGb: number;
    k8sClusters: number;
    regions: string[];
  };
};

const planColors: Record<string, string> = {
  STARTER: "bg-slate-100 text-slate-800",
  PROFESSIONAL: "bg-blue-100 text-blue-800",
  ENTERPRISE: "bg-violet-100 text-violet-800",
};

export function OwnerCommandCenter() {
  const [data, setData] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<{ status?: string; latencyMs?: number } | null>(null);

  const load = () => {
    fetch("/api/platform/stats")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d);
      })
      .finally(() => setLoading(false));
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const patchOrg = async (id: string, body: { status?: string; plan?: string }) => {
    const res = await fetch(`/api/platform/organizations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) load();
  };

  const k = data?.kpis;

  const kpis = [
    { label: "MRR", value: k ? `$${k.mrr.toLocaleString()}` : "-", icon: DollarSign },
    { label: "ARR", value: k ? `$${k.arr.toLocaleString()}` : "-", icon: DollarSign },
    { label: "Tenants", value: k?.tenants ?? "-", icon: Building2 },
    { label: "Usuarios", value: k?.users ?? "-", icon: Users },
    { label: "Uptime", value: k ? `${k.uptime}%` : "-", icon: Activity },
    { label: "Churn", value: k ? `${k.churnRate}%` : "-", icon: Globe2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-xs font-bold">
              GC
            </div>
            <div>
              <p className="font-display font-bold text-sm">Global Enterprise Command Center</p>
              <p className="text-[10px] text-slate-400">Emprenor Nexus — Platform Owner</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-300" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-1" /> Web
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-300" asChild>
              <Link href="/dashboard">Tenant demo</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Ecosistema global</h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitoreo multinacional de tenants, billing, seguridad y operaciones
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="bg-slate-900 border-white/10 text-white">
                <CardContent className="p-4">
                  <Icon className="h-4 w-4 text-violet-400 mb-2" />
                  <p className="text-xl font-mono font-bold">{loading ? "…" : item.value}</p>
                  <p className="text-[11px] text-slate-400">{item.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-slate-900 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Tenants empresariales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-32 bg-slate-800 animate-pulse rounded" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 text-left border-b border-white/10">
                        <th className="pb-2">Empresa</th>
                        <th className="pb-2">Plan</th>
                        <th className="pb-2">Estado</th>
                        <th className="pb-2 text-right">Users</th>
                        <th className="pb-2 text-right">Obras</th>
                        <th className="pb-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.tenants.map((t) => (
                        <tr key={t.id} className="border-b border-white/5">
                          <td className="py-3">
                            <p className="font-medium">{t.name}</p>
                            <p className="text-xs text-slate-500">{t.slug}</p>
                          </td>
                          <td>
                            <Badge className={planColors[t.plan] ?? ""} variant="secondary">
                              {t.plan}
                            </Badge>
                          </td>
                          <td className="text-slate-300">{t.status}</td>
                          <td className="text-right font-mono">{t.users}</td>
                          <td className="text-right font-mono">{t.projects}</td>
                          <td className="text-right py-3">
                            <div className="flex justify-end gap-1">
                              {t.status !== "ACTIVE" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-green-600 text-green-400"
                                  onClick={() => patchOrg(t.id, { status: "ACTIVE" })}
                                >
                                  Activar
                                </Button>
                              )}
                              {t.status !== "SUSPENDED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-red-600 text-red-400"
                                  onClick={() => patchOrg(t.id, { status: "SUSPENDED" })}
                                >
                                  Suspender
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Server className="h-4 w-4" /> Salud del sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Health</span>
                <span className="font-mono text-green-400">{health?.status ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latencia API</span>
                <span className="font-mono">{data?.system.apiLatencyMs ?? "—"} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Storage</span>
                <span className="font-mono">{data?.system.storageUsedGb ?? "—"} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Clusters K8s</span>
                <span className="font-mono">{data?.system.k8sClusters ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auditoria 24h</span>
                <span className="font-mono">{k?.auditEvents24h ?? "—"}</span>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-slate-400 text-xs mb-1">Regiones</p>
                <p className="text-xs">{data?.system.regions.join(" · ")}</p>
              </div>
              <Button className="w-full mt-2 bg-violet-600 hover:bg-violet-500" disabled>
                <Shield className="h-4 w-4 mr-2" /> SIEM (fase 4)
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
