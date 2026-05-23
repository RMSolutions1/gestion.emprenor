"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, ArrowRight } from "lucide-react";
import { ENTERPRISE_SECTORS } from "@/lib/enterprise-sectors";

export function EnterpriseSectorsPanel() {
  return (
    <Card className="border-blue-100 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Factory className="h-5 w-5 text-blue-800" />
          Sectores industriales Argentina
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Plantillas de compliance por tipo de sitio: energia, mineria, oil & gas, agro, publico.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {ENTERPRISE_SECTORS.slice(0, 6).map((s) => (
            <Badge key={s.id} variant="secondary" className="text-[10px] font-normal">
              {s.name}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-800 hover:underline"
          >
            Crear obra <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/dashboard/compliance"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-800 hover:underline"
          >
            Biblioteca PAC <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
