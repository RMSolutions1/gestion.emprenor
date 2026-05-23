"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientProfileForm } from "@/components/clients/client-profile-form";
import type { ClientProfileDTO } from "@/lib/client-profile";
import { UserCircle } from "lucide-react";

export function ClientProfileCompleteBanner() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id;
  const [percent, setPercent] = useState<number | null>(null);
  const [profile, setProfile] = useState<ClientProfileDTO | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/users/${userId}/client-profile`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) {
          setPercent(d.completeness?.percent ?? 0);
          setProfile(d.profile ?? null);
        }
      })
      .catch(() => {});
  }, [userId, open]);

  if (percent === null || percent >= 85 || !userId) return null;

  return (
    <>
      <Card className="border-amber-200 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-900">
        <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <UserCircle className="h-10 w-10 text-amber-700 shrink-0 hidden sm:block" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-amber-900 dark:text-amber-200">
              Complete su ficha — su proveedor opera mejor con mas datos
            </p>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-1">
              Tipo de cliente, CUIT, telefono y direccion agilizan presupuestos, facturas y
              respuestas a sus consultas.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={percent} className="h-1.5 flex-1 max-w-xs" />
              <span className="text-xs font-mono text-amber-800">{percent}%</span>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 shrink-0"
            onClick={() => setOpen(true)}
          >
            Completar ficha
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Mis datos de cliente</DialogTitle>
          </DialogHeader>
          <ClientProfileForm userId={userId} initial={profile} onSaved={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
