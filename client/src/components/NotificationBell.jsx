"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import api from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);
  const router = useRouter();

  const load = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const openPopup = async () => {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      try {
        await api.patch("/notifications/read-all");
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={openPopup}
        className="relative rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b px-4 py-3 text-sm font-semibold">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => {
                    setOpen(false);
                    router.push(n.actionRoute || "/dashboard");
                  }}
                  className={`block w-full border-b border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50 ${
                    n.read ? "" : "bg-teal-50/60"
                  }`}
                >
                  <p className="text-slate-700">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(n.time)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
