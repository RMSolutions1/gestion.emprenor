"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Radio, Reply } from "lucide-react";
import { toast } from "sonner";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { roleLabel } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { ChatMessageBody } from "@/components/chat/chat-message-body";
import { ChatComposer } from "@/components/chat/chat-composer";

export type ChatMessage = {
  id: string;
  body: string;
  priority: string;
  createdAt: string;
  parentId?: string | null;
  author: { id: string; name: string; role: string };
  replies?: ChatMessage[];
};

type Props = {
  channelId: string | null;
  title?: string;
  apiBase: string;
  emptyHint?: string;
  projectId?: string;
  initialDraft?: string;
  onDraftConsumed?: () => void;
  composerPlaceholder?: string;
};

function mergeIncomingMessage(prev: ChatMessage[], msg: ChatMessage): ChatMessage[] {
  if (msg.parentId) {
    return prev.map((p) =>
      p.id === msg.parentId
        ? {
            ...p,
            replies: [...(p.replies ?? []).filter((r) => r.id !== msg.id), msg],
          }
        : p
    );
  }
  if (prev.some((x) => x.id === msg.id)) return prev;
  return [...prev, msg];
}

function MessageBubble({
  m,
  userId,
  onReply,
  nested,
}: {
  m: ChatMessage;
  userId?: string;
  onReply: (m: ChatMessage) => void;
  nested?: boolean;
}) {
  const isOwn = m.author.id === userId;
  return (
    <div
      className={cn(
        "flex flex-col max-w-[85%] group",
        isOwn ? "ml-auto items-end" : "items-start",
        nested && "ml-6 mt-2"
      )}
    >
      <div
        className={cn(
          "rounded-xl px-3 py-2 text-sm",
          isOwn ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 border"
        )}
      >
        <ChatMessageBody body={m.body} isOwn={isOwn} />
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[10px] text-muted-foreground">
          {m.author.name} · {roleLabel(m.author.role)} ·{" "}
          {new Date(m.createdAt).toLocaleString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {!nested && (
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-600 flex items-center gap-0.5"
            onClick={() => onReply(m)}
          >
            <Reply className="h-3 w-3" /> Responder
          </button>
        )}
      </div>
    </div>
  );
}

export function ChannelChatPanel({
  channelId,
  title = "Mensajes",
  apiBase,
  emptyHint = "Escribi el primer mensaje del canal.",
  projectId,
  initialDraft,
  onDraftConsumed,
  composerPlaceholder,
}: Props) {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    if (!channelId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(apiBase)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setMessages(data.messages ?? []);
      })
      .catch(() => toast.error("No se pudo cargar el chat"))
      .finally(() => setLoading(false));
  }, [apiBase, channelId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useChatSocket(channelId, (msg) => {
    const m = msg as ChatMessage;
    if (!m?.id) return;
    setMessages((prev) => mergeIncomingMessage(prev, m));
  });

  const send = async () => {
    const body = text.trim();
    if (!body || !channelId) return;
    setSending(true);
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          parentId: replyTo?.id ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setText("");
      setReplyTo(null);
      setMessages((prev) =>
        mergeIncomingMessage(prev, {
          ...data,
          createdAt: data.createdAt ?? new Date().toISOString(),
          parentId: replyTo?.id ?? null,
        })
      );
    } catch {
      toast.error("No se pudo enviar");
    } finally {
      setSending(false);
    }
  };

  if (!channelId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Selecciona un canal para ver la conversacion.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[min(70vh,640px)] border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          {title}
          <Badge variant="outline" className="ml-auto text-[10px] font-normal gap-1">
            <Radio className="h-3 w-3 text-green-500" />
            Tiempo real
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0 gap-3 pt-0">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 border rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/50">
          {loading && <p className="text-sm text-muted-foreground">Cargando...</p>}
          {!loading && messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">{emptyHint}</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="space-y-1">
              <MessageBubble m={m} userId={userId} onReply={setReplyTo} />
              {m.replies?.map((r) => (
                <MessageBubble key={r.id} m={r} userId={userId} onReply={setReplyTo} nested />
              ))}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <ChatComposer
          value={text}
          onChange={setText}
          onSend={send}
          sending={sending}
          projectId={projectId}
          placeholder={composerPlaceholder}
          replyToName={replyTo?.author.name ?? null}
          onCancelReply={() => setReplyTo(null)}
        />
      </CardContent>
    </Card>
  );
}
