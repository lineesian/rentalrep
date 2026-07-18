"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/notificationTypes";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Bell SVG ──────────────────────────────────────────────────────────────────

function BellIcon({ hasUnread }: { hasUnread: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
        stroke={hasUnread ? "#2FD4C0" : "rgba(255,255,255,0.65)"}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Notification icon per type ────────────────────────────────────────────────

function NotifIcon({ type }: { type: Notification["type"] }) {
  const icons: Record<Notification["type"], React.ReactNode> = {
    pending_nudge: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#F4B53F" strokeWidth={1.8}/>
        <path d="M12 8v4M12 16h.01" stroke="#F4B53F" strokeWidth={2} strokeLinecap="round"/>
      </svg>
    ),
    review_published: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#0E9E92" strokeWidth={1.8}/>
        <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    review_auto_published: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#0E9E92" strokeWidth={1.8}/>
        <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    new_review: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#0E9E92" strokeWidth={1.8} strokeLinejoin="round"/>
      </svg>
    ),
    window_open: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0E9E92" strokeWidth={1.8}/>
        <path d="M16 2v4M8 2v4M3 10h18" stroke="#0E9E92" strokeWidth={1.8} strokeLinecap="round"/>
      </svg>
    ),
    deposit_logged: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14H11v-2h2v2zm0-4H11V7h2v5z" fill="#F4B53F"/>
      </svg>
    ),
    deposit_returned: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#0E9E92" strokeWidth={1.8}/>
        <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    deposit_disputed: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth={1.8}/>
        <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth={2} strokeLinecap="round"/>
      </svg>
    ),
    maintenance_logged: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="#F4B53F" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    maintenance_acknowledged: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#1D4ED8" strokeWidth={1.8}/>
        <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#1D4ED8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    maintenance_resolved: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#0E9E92" strokeWidth={1.8}/>
        <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#0E9E92" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    lease_check_complete: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#0E9E92" strokeWidth={1.8} strokeLinejoin="round"/>
        <path d="M14 2v6h6M9 13l2 2 4-4" stroke="#0E9E92" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    move_in_report_shared: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="#0E9E92" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    move_in_report_acknowledged: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#0E9E92" strokeWidth={1.8} strokeLinecap="round"/>
        <path d="M22 4L12 14.01l-3-3" stroke="#0E9E92" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };
  return <>{icons[type]}</>;
}

// ── Main component ────────────────────────────────────────────────────────────

export function NotificationBell({ userId }: { userId: string }) {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const supabase  = createClient();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread   = unreadCount > 0;

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifications((data ?? []) as Notification[]);
    setLoading(false);
  }, [userId, supabase]);

  // Initial fetch + refresh when drawer opens
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  useEffect(() => { if (open) fetchNotifications(); }, [open, fetchNotifications]);

  // Supabase realtime subscription for new notifications
  useEffect(() => {
    const channel = supabase
      .channel("notifications-bell")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => fetchNotifications(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, supabase, fetchNotifications]);

  // Close on click-outside
  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // ── Actions ───────────────────────────────────────────────────────────────

  async function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full focus:outline-none"
        aria-label={hasUnread ? `${unreadCount} unread notifications` : "Notifications"}
      >
        <BellIcon hasUnread={hasUnread} />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-petrol-400" />
        )}
      </button>

      {/* ── Backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Drawer ── */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: "min(320px, 100vw)" }}
        aria-label="Notifications panel"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-[17px] text-petrol-400">Notifications</h2>
          <div className="flex items-center gap-3">
            {hasUnread && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-teal-400 font-body underline-offset-2 hover:underline"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-sage-400 text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="text-center py-12 text-sm text-sage-400 font-body">
              Loading…
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="mb-4" aria-hidden="true">
                <path
                  d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                  stroke="#5E7470"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="font-heading font-semibold text-petrol-400 mb-1">No notifications yet</p>
              <p className="text-xs text-sage-400 font-body leading-relaxed">
                You&apos;ll be notified when someone reviews you or your reviews are published.
              </p>
            </div>
          )}

          {!loading && notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => { if (!n.read) markRead(n.id); }}
              className={`w-full text-left px-5 py-4 border-b border-gray-50 flex items-start gap-3 transition-colors hover:bg-gray-50 ${
                n.read ? "" : "bg-teal-50/60 border-l-4 border-l-teal-400"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                <NotifIcon type={n.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-semibold font-heading leading-snug mb-0.5 ${
                  n.read ? "text-sage-400" : "text-petrol-400"
                }`}>
                  {n.title}
                </p>
                <p className="text-[12px] text-sage-400 font-body leading-relaxed">
                  {n.body}
                </p>
                <p className="text-[11px] text-sage-400/70 font-body mt-1">
                  {timeAgo(n.created_at)}
                </p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0 mt-1.5" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
