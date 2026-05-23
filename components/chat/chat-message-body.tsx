"use client";

import { splitMentionSegments } from "@/lib/chat-mentions";
import { cn } from "@/lib/utils";

export function ChatMessageBody({
  body,
  isOwn,
}: {
  body: string;
  isOwn?: boolean;
}) {
  const segments = splitMentionSegments(body);
  return (
    <p className="whitespace-pre-wrap">
      {segments.map((seg, i) =>
        seg.type === "mention" ? (
          <span
            key={i}
            className={cn(
              "font-semibold",
              isOwn ? "text-blue-100 underline" : "text-blue-700 dark:text-blue-300"
            )}
          >
            @{seg.value}
          </span>
        ) : (
          <span key={i}>{seg.value}</span>
        )
      )}
    </p>
  );
}
