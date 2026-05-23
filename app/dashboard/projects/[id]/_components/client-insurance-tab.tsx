"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { isAdmin, isCliente } from "@/lib/roles";
import { isExpired } from "@/lib/compliance";

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-AR");
}

export function ClientInsuranceTab({
  projectId,
  project,
  role,
  onUpdate,
}: {
  projectId: string;
  project: {
    liabilityInsurancePolicy?: string | null;
    liabilityInsuranceInsurer?: string | null;
    liabilityInsuranceExpiry?: string | Date | null;
    name?: string;
  };
  role: string;
  onUpdate?: () => void;
}) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch(`/api/documents?projectId=${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setDocuments(list.filter((d: { category: string }) => d.category === "SEGUROS"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const expiry = project?.liabilityInsuranceExpiry;
  const policyOk =
    !!project?.liabilityInsurancePolicy?.trim() &&
    !!project?.liabilityInsuranceInsurer?.trim() &&
    !isExpired(expiry);

  const clientView = isCliente(role);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-700" />
            Seguro del proveedor — responsabilidad civil / terceros
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {clientView
              ? "Verifique que quien ejecuta la obra en su domicilio cuenta con poliza vigente ante danos a terceros (ej. roturas, caidas, vehiculos)."
              : "Datos de la poliza de RC que el cliente puede consultar en su portal."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={
                policyOk
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }
            >
              {policyOk ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Poliza registrada y vigente
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" /> Pendiente o vencida
                </>
              )}
            </Badge>
          </div>
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Aseguradora</dt>
              <dd className="font-medium">{project?.liabilityInsuranceInsurer || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">N° poliza</dt>
              <dd className="font-medium">{project?.liabilityInsurancePolicy || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wide">Vencimiento</dt>
              <dd className="font-medium">{formatDate(expiry)}</dd>
            </div>
          </dl>
          {isAdmin(role) && (
            <p className="text-xs text-muted-foreground">
              Edite estos datos en Informacion del proyecto (campos de poliza RC).
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos de seguro cargados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-12 bg-muted animate-pulse rounded" />
          ) : documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              El proveedor aun no adjunto la poliza en documentos (categoria Seguros).
            </p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg border text-sm"
                >
                  <span>{doc.fileName}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const res = await fetch(`/api/documents/download?id=${doc.id}`);
                      const data = await res.json();
                      if (data?.url) window.open(data.url, "_blank");
                    }}
                  >
                    Ver
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
