"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

function getSocket() {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = io({
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
}

export function useChatSocket(
  channelId: string | null,
  onMessage: (msg: unknown) => void
) {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!channelId) return;
    const s = getSocket();
    if (!s) return;

    s.emit("channel:join", channelId);

    const onNew = (payload: unknown) => {
      handlerRef.current(payload);
    };
    s.on("message:new", onNew);

    return () => {
      s.emit("channel:leave", channelId);
      s.off("message:new", onNew);
    };
  }, [channelId]);
}
