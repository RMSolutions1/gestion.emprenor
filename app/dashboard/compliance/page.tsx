import { Suspense } from "react";
import { ComplianceContent } from "./_components/compliance-content";

export const dynamic = "force-dynamic";

export default function CompliancePage() {
  return (
    <Suspense
      fallback={<div className="h-40 bg-muted animate-pulse rounded-xl" />}
    >
      <ComplianceContent />
    </Suspense>
  );
}
