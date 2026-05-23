"use client";

import { useCallback, useEffect, useRef } from "react";

export function useLivePoll(callback: () => void, intervalMs = 15000, enabled = true) {
  const saved = useRef(callback);
  saved.current = callback;

  const tick = useCallback(() => {
    saved.current();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [tick, intervalMs, enabled]);
}
