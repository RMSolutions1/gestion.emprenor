"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useLivePoll } from "@/hooks/use-live-poll";

type Alert = {
  id: string;
  kind: string;
  name: string;
  projectId: string;
  projectName: string;
  issues: string[];
  level: string;
};

export function ExpiryAlertsBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState({ total: 0, expired: 0, soon: 0 });

  const load = useCallback(() => {
    fetch("/api/compliance/expiry-alerts")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setAlerts((data.alerts ?? []).slice(0, 5));
          setSummary(data.summary ?? { total: 0, expired: 0, soon: 0 });
        }
      })
      .catch(console.error);
  }, []);

  useLivePoll(load, 60000, true);

  if (summary.total === 0) return null;

  return (
    <div className="rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/30 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">
            Alertas de vencimiento — {summary.expired} vencidos, {summary.soon} por vencer
          </p>
          <ul className="mt-2 space-y-1">
            {alerts.map((a) => (
              <li key={`${a.kind}-${a.id}`} className="text-xs text-rose-800 dark:text-rose-200">
                <Link
                  href={`/dashboard/projects/${a.projectId}?tab=${a.kind === "vehicle" ? "vehicles" : "workers"}`}
                  className="hover:underline font-medium"
                >
                  {a.projectName}
                </Link>
                {" · "}
                {a.name}: {a.issues[0]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
