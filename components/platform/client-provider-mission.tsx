"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CLIENT_EXAMPLES,
  CLIENT_PORTAL_INTRO,
  DOCUMENTATION_SCOPE,
  PLATFORM_MISSION,
  PROVIDER_EXAMPLES,
} from "@/lib/platform-positioning";
import { FileText, HardHat, MessageSquare, ArrowRight } from "lucide-react";

type Props = {
  variant?: "dashboard" | "project";
  projectId?: string;
  className?: string;
};

export function ClientProviderMissionCard({
  variant = "dashboard",
  projectId,
  className,
}: Props) {
  const chatHref = projectId
    ? `/dashboard/projects/${projectId}?tab=chat`
    : "/dashboard/comunicaciones";

  return (
    <Card className={className ?? "border-emprenor/15 bg-emprenor/[0.03]"}>
      <CardContent className="py-4 space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emprenor">
            {PLATFORM_MISSION.headline}
          </p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {CLIENT_PORTAL_INTRO}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {DOCUMENTATION_SCOPE.map((block) => {
            const Icon = block.title.includes("personal") ? HardHat : FileText;
            return (
              <div
                key={block.title}
                className="rounded-lg border bg-background/80 p-3 text-sm"
              >
                <p className="font-medium flex items-center gap-2">
                  <Icon className="h-4 w-4 text-emprenor shrink-0" />
                  {block.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {block.desc}
                </p>
              </div>
            );
          })}
        </div>

        {variant === "dashboard" && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] text-muted-foreground w-full mb-0.5">
              Ejemplos de clientes que pueden usar el portal:
            </span>
            {CLIENT_EXAMPLES.slice(0, 4).map((e) => (
              <Badge key={e} variant="secondary" className="text-[10px] font-normal">
                {e}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-dashed">
          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-emprenor shrink-0 mt-0.5" />
            Dudas, consultas o pedidos de justificacion: escriba directo al proveedor; queda
            registrado en la plataforma.
          </p>
          <Button size="sm" className="bg-emprenor hover:bg-emprenor-light shrink-0" asChild>
            <Link href={chatHref}>
              Ir a consultas <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Bloque corto para marketing / login */
export function PlatformEssenceStrip() {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {PROVIDER_EXAMPLES.slice(0, 3).map((p) => (
        <Badge
          key={p}
          variant="outline"
          className="border-white/20 text-slate-300 font-normal"
        >
          Proveedor: {p}
        </Badge>
      ))}
      {CLIENT_EXAMPLES.slice(0, 3).map((c) => (
        <Badge
          key={c}
          variant="outline"
          className="border-emprenor/40 text-blue-200 font-normal"
        >
          Cliente: {c}
        </Badge>
      ))}
    </div>
  );
}
