"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
  Check,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface DateNavigatorProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  refreshTrigger?: any;
}

interface DayStat {
  totalCount: number;
  completedCount: number;
  percentage: number;
}

export function DateNavigator({ selectedDate, onSelectDate, refreshTrigger }: DateNavigatorProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [weekStats, setWeekStats] = useState<Record<string, DayStat>>({});

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

  // Build the 7 days centered around selectedDate's week
  const getWeekDays = () => {
    const parts = selectedDate.split("-").map(Number);
    const baseDate = new Date(Date.UTC(parts[0] || 1970, (parts[1] || 1) - 1, parts[2] || 1));
    const dayOfWeek = baseDate.getUTCDay(); // 0 = Sunday, 1 = Monday ...

    // Start on Sunday of this week
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

  // Fetch completion stats for the current 7-day week
  const fetchWeekStats = useCallback(async () => {
    if (weekDays.length < 7) return;
    const startIso = weekDays[0]?.iso;
    const endIso = weekDays[6]?.iso;
    if (!startIso || !endIso) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/daily-plan/week-stats?startDate=${startIso}&endDate=${endIso}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setWeekStats(data.stats || {});
      }
    } catch (err) {
      console.error("Failed to fetch week stats", err);
    }
  }, [weekDays[0]?.iso, weekDays[6]?.iso]);

  useEffect(() => {
    fetchWeekStats();
  }, [fetchWeekStats, refreshTrigger]);

  // Helper to determine heatmap shade styles
  const getHeatmapStyles = (percent: number, hasItems: boolean, isSelected: boolean) => {
    if (!hasItems || percent === 0) {
      return {
        card: "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300",
        badge: "text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80",
        dayLabel: isSelected ? "text-blue-600 dark:text-blue-400 font-black" : "text-zinc-400 dark:text-zinc-500 font-bold",
        numColor: isSelected ? "text-zinc-950 dark:text-white" : "text-zinc-700 dark:text-zinc-300",
      };
    }

    if (percent >= 100) {
      // 100% Complete - Deep Vibrant Emerald
      return {
        card: "bg-emerald-600 dark:bg-emerald-600 border-emerald-500 dark:border-emerald-500 text-white shadow-sm shadow-emerald-600/30",
        badge: "bg-white text-emerald-700 font-black shadow-xs",
        dayLabel: "text-emerald-100 font-black",
        numColor: "text-white font-black",
      };
    }

    if (percent >= 67) {
      // Tier 3: 67% - 99% - Rich Dark Green
      return {
        card: "bg-emerald-500/25 dark:bg-emerald-800/60 border-emerald-400/80 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100",
        badge: "bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white font-bold",
        dayLabel: isSelected ? "text-blue-600 dark:text-blue-400 font-black" : "text-emerald-700 dark:text-emerald-300 font-bold",
        numColor: "text-emerald-950 dark:text-emerald-100 font-extrabold",
      };
    }

    if (percent >= 34) {
      // Tier 2: 34% - 66% - Medium Green
      return {
        card: "bg-emerald-500/15 dark:bg-emerald-900/40 border-emerald-300/70 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200",
        badge: "bg-emerald-200/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold",
        dayLabel: isSelected ? "text-blue-600 dark:text-blue-400 font-black" : "text-emerald-600 dark:text-emerald-400 font-bold",
        numColor: "text-emerald-900 dark:text-emerald-200 font-extrabold",
      };
    }

    // Tier 1: 1% - 33% - Light Green Tint
    return {
      card: "bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300",
      badge: "bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold",
      dayLabel: isSelected ? "text-blue-600 dark:text-blue-400 font-black" : "text-emerald-600/80 dark:text-emerald-400/80 font-bold",
      numColor: "text-emerald-900 dark:text-emerald-300 font-bold",
    };
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl p-4 shadow-sm space-y-3.5">
      {/* Top row: Direct Picker, Day Shift, Jump to Today, Week Shift */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
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
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white transition-colors cursor-pointer shadow-xs"
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-xs sm:text-sm font-bold">{formatDateLabel(selectedDate)}</span>
              <span className="text-[10px] text-zinc-400 font-normal hidden sm:inline">({selectedDate})</span>
            </button>
          </div>

          {/* Quick Step Day Buttons */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => handleShiftDays(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleShiftDays(1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Quick Jump Presets & Today button */}
        <div className="flex items-center gap-2">
          {/* Quick Jump: Today Button */}
          {!isToday ? (
            <button
              type="button"
              onClick={() => onSelectDate(todayIso)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all animate-pulse"
              title="Jump to Today's date"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Jump to Today</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
              ⚡ Today
            </span>
          )}

          {/* Week Shift Prev / Next */}
          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <button
              type="button"
              onClick={() => handleShiftWeek(-1)}
              className="px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors font-medium"
              title="Previous Week (-7 days)"
            >
              &larr; Prev Week
            </button>
            <button
              type="button"
              onClick={() => handleShiftWeek(1)}
              className="px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors font-medium"
              title="Next Week (+7 days)"
            >
              Next Week &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Interactive 7-Day Clean Green Heatmap Strip */}
      <div className="grid grid-cols-7 gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-900">
        {weekDays.map((day) => {
          const stat = weekStats[day.iso] || { totalCount: 0, completedCount: 0, percentage: 0 };
          const percent = stat.percentage;
          const hasItems = stat.totalCount > 0;
          const is100 = percent === 100 && hasItems;
          const styles = getHeatmapStyles(percent, hasItems, day.isSelected);

          return (
            <button
              key={day.iso}
              type="button"
              onClick={() => onSelectDate(day.iso)}
              className={`min-h-[5.2rem] sm:min-h-[5.6rem] rounded-2xl flex flex-col justify-between p-2 sm:p-2.5 transition-all duration-200 text-center border ${
                styles.card
              } ${
                day.isSelected
                  ? "ring-2 ring-blue-600 dark:ring-blue-400 ring-offset-2 dark:ring-offset-black scale-[1.03] shadow-md z-10"
                  : "hover:scale-[1.02] shadow-xs"
              }`}
              title={`${day.iso}: ${stat.completedCount}/${stat.totalCount} completed (${percent}%)`}
            >
              {/* Top Row: Day Name + Today Indicator */}
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider ${styles.dayLabel}`}>
                  {day.dayName}
                </span>

                {day.isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${is100 ? "bg-white" : "bg-blue-500"} shadow-xs`}
                    title="Today"
                  />
                )}
              </div>

              {/* Middle Row: Date Number */}
              <div className="my-0.5">
                <span className={`text-base sm:text-lg tracking-tight ${styles.numColor}`}>
                  {day.dayNum}
                </span>
              </div>

              {/* Bottom Row: Completion Percentage Badge */}
              <div className="flex items-center justify-center w-full">
                {hasItems ? (
                  is100 ? (
                    <span className={`inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md ${styles.badge}`}>
                      <Check className="w-2.5 h-2.5 stroke-[3]" /> 100%
                    </span>
                  ) : percent > 0 ? (
                    <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md ${styles.badge}`}>
                      {percent}%
                    </span>
                  ) : (
                    <span className="text-[9px] sm:text-[10px] font-medium text-zinc-400 dark:text-zinc-500 px-1">
                      0%
                    </span>
                  )
                ) : (
                  <span className="text-[9px] text-zinc-300 dark:text-zinc-600 font-light">
                    -
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-zinc-400 px-1">
        <span className="font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>Weekly Heatmap Activity</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700" />
            <span>0%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800" />
            <span>1-33%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/25 dark:bg-emerald-900/60 border border-emerald-400 dark:border-emerald-700" />
            <span>34-66%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 dark:bg-emerald-800/80 border border-emerald-500 dark:border-emerald-600" />
            <span>67-99%</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 border border-emerald-500 text-white font-bold flex items-center justify-center text-[7px]">✓</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">100%</span>
          </span>
        </div>
      </div>
    </div>
  );
}
