"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Phone, MapPin } from "lucide-react";
import { ClientProfileDialog } from "@/components/clients/client-profile-dialog";
import {
  CLIENT_ENTITY_LABELS,
  completenessTone,
  type ClientProfileDTO,
} from "@/lib/client-profile";

type Mandante = {
  userId: string;
  name: string;
  email: string;
  profile: ClientProfileDTO | null;
  completeness: number;
};

export function ProjectMandantePanel({
  projectId,
  role,
}: {
  projectId: string;
  role: string;
}) {
  const [mandantes, setMandantes] = useState<Mandante[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then(async (project) => {
        const clients =
          project?.assignments?.filter?.((a: { user?: { role?: string } }) => a.user?.role === "CLIENTE") ??
          [];
        const loaded = await Promise.all(
          clients.map(async (a: { user: { id: string; name: string; email: string } }) => {
            const res = await fetch(`/api/users/${a.user.id}/client-profile`);
            const d = await res.json();
            return {
              userId: a.user.id,
              name: a.user.name,
              email: a.user.email,
              profile: d.profile ?? null,
              completeness: d.completeness?.percent ?? 0,
            };
          })
        );
        setMandantes(loaded);
      })
      .catch(console.error);
  }, [projectId, editId]);

  if (mandantes.length === 0) return null;

  return (
    <>
      <Card className="border-emprenor/15">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emprenor" />
            Datos del mandante
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Mas informacion del cliente = mejor facturacion, consultas y cierre de obra.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {mandantes.map((m) => {
            const tone = completenessTone(m.completeness);
            const p = m.profile;
            return (
              <div key={m.userId} className="rounded-lg border p-3 text-sm space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{p?.legalName ?? m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <Badge
                    variant={tone === "high" ? "default" : "secondary"}
                    className={
                      tone === "low"
                        ? "bg-amber-100 text-amber-900"
                        : tone === "high"
                          ? "bg-emerald-100 text-emerald-900"
                          : ""
                    }
                  >
                    Ficha {m.completeness}%
                  </Badge>
                </div>
                {p && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{CLIENT_ENTITY_LABELS[p.entityType]}</span>
                    {p.taxId && <span>CUIT {p.taxId}</span>}
                    {p.sector && <span>{p.sector}</span>}
                    {p.phone && (
                      <span className="flex items-center gap-0.5">
                        <Phone className="h-3 w-3" /> {p.phone}
                      </span>
                    )}
                    {(p.city || p.billingAddress) && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {[p.billingAddress, p.city, p.province].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                )}
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => {
                      setEditId(m.userId);
                      setEditName(m.name);
                    }}
                  >
                    Editar ficha completa
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <ClientProfileDialog
        userId={editId}
        userName={editName}
        open={!!editId}
        onOpenChange={(o) => !o && setEditId(null)}
        onSaved={() => setEditId(null)}
      />
    </>
  );
}
