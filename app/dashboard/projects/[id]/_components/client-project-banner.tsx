"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ClientPendingActions,
  type PendingExtra,
  type PendingReport,
} from "@/app/dashboard/_components/client-pending-actions";
import { ClientSiteAlerts, type SiteAlert } from "@/app/dashboard/_components/client-site-alerts";

export function ClientProjectBanner({ projectId }: { projectId: string }) {
  const [data, setData] = useState<{
    pendingReports: PendingReport[];
    pendingExtras: PendingExtra[];
    siteAlerts: SiteAlert[];
  } | null>(null);

  const load = useCallback(() => {
    fetch(`/api/dashboard/client-alerts?projectId=${projectId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.error) setData(json);
      })
      .catch(console.error);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) return null;

  const hasPending = data.pendingReports.length + data.pendingExtras.length > 0;
  const hasSite = data.siteAlerts.length > 0;
  if (!hasPending && !hasSite) return null;

  return (
    <div className="space-y-4">
      <ClientPendingActions
        reports={data.pendingReports}
        extras={data.pendingExtras}
        compact
        onAction={load}
      />
      <ClientSiteAlerts alerts={data.siteAlerts} compact />
    </div>
  );
}
