"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Building2, HardHat, User, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChannelChatPanel } from "@/components/chat/channel-chat-panel";
import { toast } from "sonner";

type ChannelRow = {
  id: string;
  type: string;
  name: string;
  project?: { id: string; name: string } | null;
  _count?: { messages: number };
  messages?: { body: string; createdAt: string; author: { name: string } }[];
};

type OrgUser = { id: string; name: string; email: string };

export function CommunicationsHub() {
  const [channels, setChannels] = useState<ChannelRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dmOpen, setDmOpen] = useState(false);
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
  const [targetUserId, setTargetUserId] = useState("");
  const [creatingDm, setCreatingDm] = useState(false);

  const loadChannels = useCallback(() => {
    fetch("/api/chat/channels")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setChannels(data);
          setSelectedId((prev) => prev ?? data[0]?.id ?? null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  useEffect(() => {
    if (dmOpen) {
      fetch("/api/chat/mentionables")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setOrgUsers(data);
        });
    }
  }, [dmOpen]);

  const startDm = async () => {
    if (!targetUserId) return;
    setCreatingDm(true);
    try {
      const res = await fetch("/api/chat/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const ch = await res.json();
      if (!res.ok) throw new Error(ch.error);
      toast.success("Conversacion directa lista");
      setDmOpen(false);
      setTargetUserId("");
      loadChannels();
      setSelectedId(ch.id);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al crear DM");
    } finally {
      setCreatingDm(false);
    }
  };

  const selected = channels.find((c) => c.id === selectedId);

  const channelIcon = (type: string) => {
    if (type === "ORGANIZATION") return <Building2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />;
    if (type === "DIRECT") return <User className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />;
    return <HardHat className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-blue-600" />
            Comunicaciones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Empresa, obras y mensajes directos. Menciona con @nombre y responde en hilos.
          </p>
        </div>
        <Dialog open={dmOpen} onOpenChange={setDmOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-800 hover:bg-blue-900">
              <Plus className="h-4 w-4 mr-1" /> Mensaje directo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo mensaje directo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Select value={targetUserId} onValueChange={setTargetUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegir usuario" />
                </SelectTrigger>
                <SelectContent>
                  {orgUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full bg-blue-800"
                disabled={!targetUserId || creatingDm}
                onClick={startDm}
              >
                Abrir conversacion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        <Card className="border-slate-200 dark:border-slate-800 h-fit max-h-[70vh] overflow-hidden flex flex-col">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : channels.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No hay canales activos.</p>
            ) : (
              <ul className="overflow-y-auto max-h-[min(70vh,560px)]">
                {channels.map((ch) => {
                  const last = ch.messages?.[0];
                  const active = ch.id === selectedId;
                  return (
                    <li key={ch.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(ch.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 border-b transition-colors",
                          active ? "bg-blue-50 dark:bg-blue-950/40" : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {channelIcon(ch.type)}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{ch.name}</p>
                            {last && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {last.author.name}: {last.body}
                              </p>
                            )}
                            {ch.project && (
                              <Link
                                href={`/dashboard/projects/${ch.project.id}?tab=chat`}
                                className="text-[10px] text-blue-600 hover:underline mt-1 inline-block"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Ver proyecto
                              </Link>
                            )}
                          </div>
                          {ch._count && ch._count.messages > 0 && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              {ch._count.messages}
                            </Badge>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <ChannelChatPanel
          channelId={selectedId}
          title={selected?.name ?? "Canal"}
          apiBase={selectedId ? `/api/chat/channels/${selectedId}` : ""}
          emptyHint="Canal listo. Usa @ para mencionar y el boton Responder para hilos."
        />
      </div>
    </div>
  );
}
