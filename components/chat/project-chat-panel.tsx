"use client";

import { useEffect, useState } from "react";
import { ChannelChatPanel } from "@/components/chat/channel-chat-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { isCliente } from "@/lib/roles";
import {
  CONSULTATION_HINTS,
  PLATFORM_MISSION,
} from "@/lib/platform-positioning";

export function ProjectChatPanel({
  projectId,
  role = "CLIENTE",
}: {
  projectId: string;
  role?: string;
}) {
  const [channelId, setChannelId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const clientMode = isCliente(role);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/chat`)
      .then((r) => r.json())
      .then((data) => setChannelId(data.channel?.id ?? null))
      .catch(() => setChannelId(null));
  }, [projectId]);

  return (
    <div className="space-y-3">
      {clientMode ? (
        <>
          <Card className="border-emprenor/15 bg-emprenor/[0.03]">
            <CardContent className="py-3">
              <p className="text-sm font-medium text-emprenor flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Consultas y justificaciones al proveedor
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {PLATFORM_MISSION.essence} Escriba aqui sus dudas; el proveedor responde en la
                misma linea de tiempo, con registro para usted y para auditoria.
              </p>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-1.5">
            {CONSULTATION_HINTS.map((hint) => (
              <Button
                key={hint}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto min-h-8 py-1.5 text-xs text-left whitespace-normal"
                onClick={() => setDraft(hint)}
              >
                {hint.length > 48 ? `${hint.slice(0, 46)}…` : hint}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          Canal oficial del proyecto con el cliente. Reemplace WhatsApp: cada consulta y
          justificacion queda registrada.
        </p>
      )}
      <ChannelChatPanel
        channelId={channelId}
        title={clientMode ? "Consultas al proveedor" : "Comunicacion con el cliente"}
        apiBase={`/api/projects/${projectId}/chat`}
        projectId={projectId}
        initialDraft={draft}
        onDraftConsumed={() => setDraft("")}
        emptyHint={
          clientMode
            ? "Aun no hay mensajes. Escriba una consulta o solicite una justificacion."
            : "Sin mensajes. El cliente puede consultar desde su portal."
        }
        composerPlaceholder={
          clientMode
            ? "Escriba su consulta o pedido de justificacion..."
            : "Respuesta al cliente... Use @nombre para mencionar al equipo"
        }
      />
    </div>
  );
}
