"use client";

import { useState, useEffect, useCallback } from "react";
import { ReminderItem } from "@/types/habit";
import { Bell, BellRing, Clock, Check, ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface ReminderBannerProps {
  selectedDate: string;
  onRefresh?: () => void;
}

export function ReminderBanner({ selectedDate, onRefresh }: ReminderBannerProps) {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [browserNotificationsAllowed, setBrowserNotificationsAllowed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/reminders/today?date=${selectedDate}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (err) {
      console.error("Failed to fetch reminders", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchReminders();
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserNotificationsAllowed(Notification.permission === "granted");
    }
  }, [fetchReminders]);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setBrowserNotificationsAllowed(permission === "granted");
    }
  };

  if (dismissed || reminders.length === 0) return null;

  const pendingReminders = reminders.filter((r) => !r.isCompleted);
  const nextReminder = pendingReminders[0] || reminders[0];

  return (
    <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-3.5 shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <BellRing className="w-4 h-4 animate-bounce" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Today&apos;s Reminders ({pendingReminders.length} pending)
              </span>
              {nextReminder && (
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span className="font-bold">{nextReminder.reminderTime}</span>: {nextReminder.title}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!browserNotificationsAllowed && (
            <button
              onClick={requestNotificationPermission}
              className="hidden sm:inline-flex text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/40 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              🔔 Enable Browser Alerts
            </button>
          )}

          {reminders.length > 1 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-amber-500/10 transition-colors"
            >
              {expanded ? "Hide" : `View All (${reminders.length})`}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="w-6 h-6 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-amber-500/10 flex items-center justify-center transition-colors"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded List of Reminders */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {reminders.map((r) => (
            <div
              key={r.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                r.isCompleted
                  ? "bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                  : "bg-white dark:bg-zinc-950 border-amber-500/30 text-zinc-900 dark:text-white shadow-2xs"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="text-xs font-bold">{r.reminderTime}</span>
                </div>
                <div
                  className={`text-xs truncate font-medium mt-0.5 ${
                    r.isCompleted ? "line-through text-zinc-400" : ""
                  }`}
                >
                  {r.title}
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                {r.sourceType}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
