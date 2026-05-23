"use client";

import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Loader2 } from "lucide-react";
import { useLivePoll } from "@/hooks/use-live-poll";
import Link from "next/link";

type FeedEvent = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  createdAt: string;
  project?: { id: string; name: string } | null;
};

const typeLabels: Record<string, string> = {
  WORKER_ADDED: "Personal",
  REPORT_SUBMITTED: "Informe",
  REPORT_APPROVED: "Aprobacion",
  REPORT_REJECTED: "Rechazo",
  EXTRA_PENDING: "Adicional",
  INCIDENT_CREATED: "Incidencia",
  COMPLIANCE_ALERT: "Compliance",
  DOCUMENT_UPLOADED: "Documento",
  SYSTEM: "Sistema",
};

export function LiveFeedPanel({
  projectId,
  title = "Operaciones en vivo",
  compact = false,
}: {
  projectId?: string;
  title?: string;
  compact?: boolean;
}) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(() => {
    const q = projectId ? `?projectId=${projectId}&limit=20` : "?limit=25";
    fetch(`/api/live-feed${q}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useLivePoll(fetchFeed, 12000, true);

  return (
    <Card className="border-border/80 dark:border-slate-700/80 dark:bg-card/80">
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className="text-base font-display flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <Radio className="h-4 w-4 text-orange-500" />
          {title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">Actualizacion automatica cada 12s</p>
      </CardHeader>
      <CardContent>
        {loading && events.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Sin actividad reciente</p>
        ) : (
          <ul className={`space-y-2 ${compact ? "max-h-64" : "max-h-96"} overflow-y-auto pr-1`}>
            {events.map((e) => (
              <li
                key={e.id}
                className="p-3 rounded-lg border bg-muted/20 dark:bg-slate-900/40 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px]">
                    {typeLabels[e.type] ?? e.type}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString("es-AR")}
                  </span>
                </div>
                <p className="font-medium">{e.title}</p>
                {e.body && <p className="text-xs text-muted-foreground mt-0.5">{e.body}</p>}
                {e.project && (
                  <Link
                    href={`/dashboard/projects/${e.project.id}`}
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    {e.project.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
