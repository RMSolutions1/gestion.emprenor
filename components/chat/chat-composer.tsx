"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { mentionSlug } from "@/lib/chat-mentions";
import { cn } from "@/lib/utils";

type MentionUser = { id: string; name: string; slug: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sending?: boolean;
  placeholder?: string;
  projectId?: string;
  replyToName?: string | null;
  onCancelReply?: () => void;
};

export function ChatComposer({
  value,
  onChange,
  onSend,
  sending,
  placeholder = "Mensaje... Usa @nombre para mencionar",
  projectId,
  replyToName,
  onCancelReply,
}: Props) {
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const at = value.lastIndexOf("@");
    if (at < 0) {
      setMentionOpen(false);
      return;
    }
    const after = value.slice(at + 1);
    if (after.includes(" ") || after.includes("\n")) {
      setMentionOpen(false);
      return;
    }
    setMentionStart(at);
    const q = after.toLowerCase();
    const url = projectId
      ? `/api/chat/mentionables?projectId=${projectId}&q=${encodeURIComponent(q)}`
      : `/api/chat/mentionables?q=${encodeURIComponent(q)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSuggestions(
            data.map((u: { id: string; name: string; email?: string; slug?: string }) => ({
              id: u.id,
              name: u.name,
              slug: u.slug ?? mentionSlug({ id: u.id, name: u.name, email: u.email ?? "" }),
            }))
          );
          setMentionOpen(data.length > 0);
        }
      })
      .catch(() => setMentionOpen(false));
  }, [value, projectId]);

  const pickMention = (u: MentionUser) => {
    if (mentionStart == null) return;
    const before = value.slice(0, mentionStart);
    onChange(`${before}@${u.slug} `);
    setMentionOpen(false);
  };

  return (
    <div className="shrink-0 space-y-2">
      {replyToName && (
        <div className="flex items-center justify-between text-xs bg-muted rounded px-2 py-1">
          <span>Respondiendo a {replyToName}</span>
          {onCancelReply && (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={onCancelReply}
            >
              Cancelar
            </button>
          )}
        </div>
      )}
      <div className="relative flex gap-2">
        {mentionOpen && (
          <div
            ref={listRef}
            className="absolute bottom-full left-0 right-12 mb-1 max-h-40 overflow-y-auto rounded-lg border bg-popover shadow-lg z-10"
          >
            {suggestions.map((u) => (
              <button
                key={u.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                onClick={() => pickMention(u)}
              >
                <span className="font-medium">{u.name}</span>
                <span className="text-muted-foreground ml-2">@{u.slug}</span>
              </button>
            ))}
          </div>
        )}
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="min-h-[44px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <Button
          type="button"
          className="shrink-0 bg-blue-600 hover:bg-blue-700"
          disabled={sending}
          onClick={onSend}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
