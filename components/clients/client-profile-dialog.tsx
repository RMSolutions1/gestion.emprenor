"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientProfileForm } from "@/components/clients/client-profile-form";
import type { ClientProfileDTO } from "@/lib/client-profile";
import { Loader2 } from "lucide-react";

export function ClientProfileDialog({
  userId,
  userName,
  open,
  onOpenChange,
  onSaved,
}: {
  userId: string | null;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ClientProfileDTO | null>(null);

  const load = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/users/${userId}/client-profile`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setProfile(d.profile ?? null);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (open && userId) load();
  }, [open, userId, load]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Ficha del cliente — {userName}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : userId ? (
          <ClientProfileForm
            userId={userId}
            initial={profile}
            showAdminNotes
            onSaved={() => {
              onSaved?.();
              onOpenChange(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
