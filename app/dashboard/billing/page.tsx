import { Suspense } from "react";
import { BillingContent } from "./_components/billing-content";

export const metadata = {
  title: "Facturacion | Emprenor Nexus",
};

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-muted-foreground text-sm">Cargando facturacion...</div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
