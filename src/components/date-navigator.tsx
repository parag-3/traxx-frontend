"use client";

import { useState, useRef } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Zap,
} from "lucide-react";

interface DateNavigatorProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export function DateNavigator({ selectedDate, onSelectDate }: DateNavigatorProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const getTodayIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const todayIso = getTodayIso();
  const isToday = selectedDate === todayIso;

  // Format date helper
  const formatDateLabel = (isoStr: string) => {
    const parts = isoStr.split("-").map(Number);
    const d = new Date(parts[0] || 1970, (parts[1] || 1) - 1, parts[2] || 1);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Day shift
  const handleShiftDays = (delta: number) => {
    const parts = selectedDate.split("-").map(Number);
    const d = new Date(Date.UTC(parts[0] || 1970, (parts[1] || 1) - 1, parts[2] || 1));
    d.setUTCDate(d.getUTCDate() + delta);
    const newDateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    onSelectDate(newDateStr);
  };

  // Week shift
  const handleShiftWeek = (deltaWeeks: number) => {
    handleShiftDays(deltaWeeks * 7);
  };

  // Build the 7 days centered around selectedDate or current week
  const getWeekDays = () => {
    const parts = selectedDate.split("-").map(Number);
    const baseDate = new Date(Date.UTC(parts[0] || 1970, (parts[1] || 1) - 1, parts[2] || 1));
    const dayOfWeek = baseDate.getUTCDay(); // 0 = Sunday, 1 = Monday ...

    // Start on Sunday or Monday of this week
    const startOfWeek = new Date(baseDate.getTime());
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek.getTime());
      d.setUTCDate(d.getUTCDate() + i);
      const iso = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      days.push({
        iso,
        dayNum: d.getUTCDate(),
        dayName: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
        isToday: iso === todayIso,
        isSelected: iso === selectedDate,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800/80 rounded-2xl p-2.5 shadow-sm space-y-2">
      {/* Top row: Week Controls, Date Label, Jump to Today, Direct Date Picker */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        {/* Left: Date Display & Direct Picker Trigger */}
        <div className="flex items-center gap-2">
          {/* Native Hidden Date Picker input triggered on click */}
          <div className="relative">
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) onSelectDate(e.target.value);
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              title="Click to choose specific date"
            />
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold">{formatDateLabel(selectedDate)}</span>
              <span className="text-[10px] text-zinc-400 font-normal">({selectedDate})</span>
            </button>
          </div>

          {/* Quick Step Buttons */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => handleShiftDays(-1)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Previous Day (Left arrow)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleShiftDays(1)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Next Day (Right arrow)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Quick Jump Presets & Today button */}
        <div className="flex items-center gap-1.5">
          {/* Quick Jump: Today Button */}
          {!isToday ? (
            <button
              type="button"
              onClick={() => onSelectDate(todayIso)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all animate-pulse"
              title="Jump to Today's date"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Jump to Today</span>
            </button>
          ) : (
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-xl">
              ⚡ Today
            </span>
          )}

          {/* Week Shift Prev / Next */}
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <button
              type="button"
              onClick={() => handleShiftWeek(-1)}
              className="px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title="Previous Week (-7 days)"
            >
              &larr; Prev Week
            </button>
            <button
              type="button"
              onClick={() => handleShiftWeek(1)}
              className="px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title="Next Week (+7 days)"
            >
              Next Week &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Interactive 7-Day Week Strip */}
      <div className="grid grid-cols-7 gap-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-900">
        {weekDays.map((day) => (
          <button
            key={day.iso}
            type="button"
            onClick={() => onSelectDate(day.iso)}
            className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
              day.isSelected
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.03]"
                : day.isToday
                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                : "bg-zinc-50/60 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span
              className={`text-[10px] uppercase font-bold tracking-wider ${
                day.isSelected
                  ? "text-blue-100"
                  : day.isToday
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-400"
              }`}
            >
              {day.dayName}
            </span>
            <span className="text-sm font-black mt-0.5">{day.dayNum}</span>
            {day.isToday && (
              <span
                className={`w-1 h-1 rounded-full mt-0.5 ${
                  day.isSelected ? "bg-white" : "bg-blue-500"
                }`}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
