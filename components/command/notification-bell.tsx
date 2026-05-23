"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLivePoll } from "@/hooks/use-live-poll";

type NotificationRow = {
  id: string;
  title: string;
  body?: string | null;
  link?: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setNotifications(data.notifications ?? []);
          setUnreadCount(data.unreadCount ?? 0);
        }
      })
      .catch(console.error);
  }, []);

  useLivePoll(fetchNotifications, 20000, true);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    fetchNotifications();
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    fetchNotifications();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-orange-500 text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">Notificaciones</p>
          {unreadCount > 0 && (
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={markAllRead}
            >
              Marcar todas leidas
            </button>
          )}
        </div>
        <ul className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <li className="p-4 text-sm text-muted-foreground text-center">Sin notificaciones</li>
          ) : (
            notifications.map((n) => (
              <li
                key={n.id}
                className={`border-b last:border-0 px-3 py-2 text-sm ${!n.read ? "bg-orange-50/50 dark:bg-orange-950/20" : ""}`}
              >
                {n.link ? (
                  <Link
                    href={n.link}
                    className="block hover:text-primary"
                    onClick={() => {
                      if (!n.read) markRead(n.id);
                      setOpen(false);
                    }}
                  >
                    <p className="font-medium">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    )}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="text-left w-full"
                    onClick={() => !n.read && markRead(n.id)}
                  >
                    <p className="font-medium">{n.title}</p>
                  </button>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString("es-AR")}
                </p>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
