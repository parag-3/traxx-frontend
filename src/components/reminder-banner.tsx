"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ReminderItem } from "@/types/habit";
import { BellRing, Clock, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface ReminderToastProps {
  selectedDate: string;
  onRefresh?: () => void;
}

export function ReminderBanner({ selectedDate }: ReminderToastProps) {
  return <ReminderToast selectedDate={selectedDate} />;
}

export function ReminderToast({ selectedDate }: ReminderToastProps) {
  const [activeReminder, setActiveReminder] = useState<ReminderItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const shownReminderIds = useRef<Set<string>>(new Set());

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reminders/today?date=${selectedDate}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data: ReminderItem[] = await res.json();
        const pending = data.filter((r) => !r.isCompleted);

        // Find the first unshown pending reminder
        const nextUnshown = pending.find((r) => !shownReminderIds.current.has(r.id));
        if (nextUnshown) {
          shownReminderIds.current.add(nextUnshown.id);
          setActiveReminder(nextUnshown);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reminders", err);
    }
  }, [selectedDate]);

  // Periodic polling for reminders
  useEffect(() => {
    fetchReminders();
    const interval = setInterval(() => {
      fetchReminders();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchReminders]);

  // Dedicated Auto-Dismiss Timer for 2.5 - 3 seconds
  useEffect(() => {
    if (!activeReminder) return;

    setIsVisible(true);
    setIsExiting(false);

    // Stay for 2.8 seconds, then trigger exit animation
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2800);

    // After exit animation completes (350ms), remove from DOM
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      setActiveReminder(null);
      setIsExiting(false);
    }, 3150);

    return () => {
      clearTimeout(dismissTimer);
      clearTimeout(removeTimer);
    };
  }, [activeReminder]);

  const handleManualDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setActiveReminder(null);
      setIsExiting(false);
    }, 300);
  };

  if (!isVisible || !activeReminder) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 pointer-events-auto max-w-sm w-full">
      <div
        className={`relative overflow-hidden rounded-2xl p-4 bg-[#0f121a]/95 backdrop-blur-xl border border-amber-500/40 text-white shadow-2xl shadow-amber-500/10 transition-all duration-300 ${
          isExiting
            ? "opacity-0 translate-x-12 scale-95"
            : "animate-in slide-in-from-right-8 duration-300 fade-in scale-100"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Glowing Bell Icon */}
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Reminder • {activeReminder.reminderTime}</span>
              </div>
              <h4 className="text-sm font-extrabold text-white truncate mt-0.5">
                {activeReminder.title}
              </h4>
              {activeReminder.category && (
                <span className="text-[10px] text-zinc-400 font-medium">
                  {activeReminder.category} ({activeReminder.sourceType.toLowerCase()})
                </span>
              )}
            </div>
          </div>

          {/* Manual Dismiss */}
          <button
            onClick={handleManualDismiss}
            className="w-6 h-6 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close reminder"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-Second Countdown Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.05] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
            style={{
              animation: "reminderCountdown 3s linear forwards",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes reminderCountdown {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
