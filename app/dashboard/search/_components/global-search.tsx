"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{
    projects: { id: string; name: string; status: string }[];
    documents: { id: string; fileName: string; projectId: string }[];
    workOrders: { id: string; number: string; title: string; projectId: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (q.trim().length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Search className="h-7 w-7 text-blue-600" />
          Busqueda global
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Proyectos, documentos y ordenes de trabajo en tu organizacion.
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar..."
          onKeyDown={(e) => e.key === "Enter" && search()}
        />
        <Button type="button" onClick={search} className="bg-blue-800 hover:bg-blue-900" disabled={loading}>
          Buscar
        </Button>
      </div>
      {results && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Proyectos ({results.projects?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.projects?.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}`}
                  className="block text-sm hover:text-blue-600"
                >
                  {p.name}
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Documentos ({results.documents?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.documents?.map((d) => (
                <Link
                  key={d.id}
                  href={`/dashboard/projects/${d.projectId}?tab=documents`}
                  className="block text-sm hover:text-blue-600"
                >
                  {d.fileName}
                </Link>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">OT ({results.workOrders?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.workOrders?.map((w) => (
                <Link
                  key={w.id}
                  href={`/dashboard/projects/${w.projectId}?tab=work-orders`}
                  className="block text-sm hover:text-blue-600"
                >
                  {w.number} — {w.title}
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
