import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/api-helpers";
import {
  canAccessProjectTab,
  resolveInitialTab,
  type ProjectTabId,
} from "@/lib/project-workspace-nav";
import { ProjectDetail } from "./_components/project-detail";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { tab?: string };
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?callbackUrl=/dashboard/projects/${params.id}`);
  }
  const tab = searchParams?.tab as ProjectTabId | undefined;
  if (tab && !canAccessProjectTab(tab, user.role)) {
    redirect(
      `/dashboard/projects/${params.id}?tab=${resolveInitialTab(user.role, null)}`
    );
  }

  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-2">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-40 bg-muted animate-pulse rounded-xl" />
        </div>
      }
    >
      <ProjectDetail projectId={params?.id ?? ""} />
    </Suspense>
  );
}
