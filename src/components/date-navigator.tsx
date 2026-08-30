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
import { SkeletonWeekStrip } from "./skeleton";

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
  const [loadingWeekStats, setLoadingWeekStats] = useState(false);

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
      setLoadingWeekStats(true);
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
    } finally {
      setLoadingWeekStats(false);
    }
  }, [weekDays[0]?.iso, weekDays[6]?.iso]);

  useEffect(() => {
    fetchWeekStats();
  }, [fetchWeekStats, refreshTrigger]);

  // Helper to determine heatmap shade styles for minimal sleek day cards
  const getHeatmapStyles = (percent: number, hasItems: boolean, isSelected: boolean) => {
    if (!hasItems || percent === 0) {
      return {
        card: isSelected
          ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/60 dark:border-blue-400/60 shadow-xs"
          : "bg-zinc-50/60 dark:bg-[#12151f]/80 border-zinc-200/60 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.12]",
        bar: "bg-transparent",
        percentColor: "text-zinc-400 dark:text-zinc-600",
        dayLabel: isSelected ? "text-blue-600 dark:text-cyan-400 font-bold" : "text-zinc-400 dark:text-zinc-500",
        numColor: isSelected ? "text-zinc-950 dark:text-white font-bold" : "text-zinc-700 dark:text-zinc-300",
      };
    }

    if (percent >= 100) {
      return {
        card: isSelected
          ? "bg-emerald-950/20 border-emerald-500 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-500/30"
          : "bg-emerald-950/10 dark:bg-emerald-950/20 border-emerald-500/30 dark:border-emerald-500/30 hover:border-emerald-500/50",
        bar: "bg-emerald-500 shadow-xs shadow-emerald-500/50",
        percentColor: "text-emerald-600 dark:text-emerald-400 font-semibold",
        dayLabel: isSelected ? "text-emerald-500 dark:text-emerald-400 font-bold" : "text-emerald-600/80 dark:text-emerald-400/80",
        numColor: "text-zinc-900 dark:text-white font-bold",
      };
    }

    return {
      card: isSelected
        ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/60 dark:border-blue-400/60 shadow-xs"
        : "bg-zinc-50/60 dark:bg-[#12151f]/80 border-zinc-200/60 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.12]",
      bar: percent >= 67 ? "bg-emerald-500/80" : percent >= 34 ? "bg-emerald-500/60" : "bg-emerald-500/40",
      percentColor: "text-emerald-600 dark:text-emerald-400",
      dayLabel: isSelected ? "text-blue-600 dark:text-cyan-400 font-bold" : "text-zinc-400 dark:text-zinc-500",
      numColor: isSelected ? "text-zinc-950 dark:text-white font-bold" : "text-zinc-700 dark:text-zinc-300",
    };
  };

  return (
    <div className="bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* Top row: Direct Picker, Day Shift, Jump to Today, Week Shift */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        {/* Left: Date Display & Direct Picker Trigger */}
        <div className="flex items-center gap-2">
          {/* Native Hidden Date Picker input */}
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
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100/80 dark:bg-[#151926] hover:bg-zinc-200/80 dark:hover:bg-[#1c2234] border border-zinc-200/60 dark:border-white/[0.06] text-zinc-900 dark:text-white transition-colors cursor-pointer text-xs sm:text-sm font-semibold shadow-xs"
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{formatDateLabel(selectedDate)}</span>
              <span className="text-[10px] text-zinc-400 font-normal hidden sm:inline">({selectedDate})</span>
            </button>
          </div>

          {/* Quick Step Day Buttons */}
          <div className="flex items-center bg-zinc-100/80 dark:bg-[#151926] border border-zinc-200/60 dark:border-white/[0.06] rounded-xl p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => handleShiftDays(-1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1e2334] transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleShiftDays(1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1e2334] transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Quick Jump Presets & Today button */}
        <div className="flex items-center gap-2.5 text-xs">
          {!isToday ? (
            <button
              type="button"
              onClick={() => onSelectDate(todayIso)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:scale-[1.02] transition-all cursor-pointer"
              title="Jump to Today's date"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Today</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-xl border border-blue-200/50 dark:border-blue-900/40">
              ⚡ Today
            </span>
          )}

          {/* Week Shift */}
          <div className="flex items-center gap-1 text-zinc-400 text-xs">
            <button
              type="button"
              onClick={() => handleShiftWeek(-1)}
              className="px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#151926] hover:text-zinc-200 transition-colors cursor-pointer font-medium"
              title="Previous Week"
            >
              &larr; Prev
            </button>
            <button
              type="button"
              onClick={() => handleShiftWeek(1)}
              className="px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#151926] hover:text-zinc-200 transition-colors cursor-pointer font-medium"
              title="Next Week"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Sleek Minimal 7-Day Week Strip with comfortable negative space */}
      {loadingWeekStats && Object.keys(weekStats).length === 0 ? (
        <SkeletonWeekStrip />
      ) : (
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
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
                className={`group relative h-15 sm:h-17 rounded-xl flex flex-col justify-between p-2 sm:p-2.5 transition-all duration-150 text-center border cursor-pointer ${
                  styles.card
                } ${day.isSelected ? "scale-[1.02] z-10" : ""}`}
                title={`${day.iso}: ${stat.completedCount}/${stat.totalCount} completed (${percent}%)`}
              >
              {/* Top: Day Name + Today Indicator */}
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] uppercase tracking-wider ${styles.dayLabel}`}>
                  {day.dayName}
                </span>

                {day.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Today" />
                )}
              </div>

              {/* Middle: Date Number + % in one line */}
              <div className="flex items-baseline justify-center gap-1.5 my-auto">
                <span className={`text-sm sm:text-base leading-none ${styles.numColor}`}>
                  {day.dayNum}
                </span>
                {hasItems ? (
                  <span className={`text-[10px] leading-none ${styles.percentColor}`}>
                    {is100 ? "✓" : `${percent}%`}
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-300 dark:text-zinc-600 font-light">-</span>
                )}
              </div>

              {/* Bottom: Subtle minimal progress line */}
              <div className="w-full bg-zinc-200/50 dark:bg-white/[0.04] h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${styles.bar}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
