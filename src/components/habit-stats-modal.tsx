"use client";

import { useEffect, useState, useCallback } from "react";
import { Habit, HabitStats } from "@/types/habit";
import { API_BASE_URL } from "@/lib/api";
import {
  X,
  Flame,
  Trophy,
  Calendar,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Activity,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

interface HabitStatsModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HabitStatsModal({ habit, isOpen, onClose }: HabitStatsModalProps) {
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [monthLogs, setMonthLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Active view date for calendar (allows navigating any month/year)
  const [viewDate, setViewDate] = useState<Date>(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed

  // Format helpers
  const pad = (n: number) => String(n).padStart(2, "0");
  const formatIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

  const fetchStats = useCallback(async () => {
    if (!habit) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/habits/${habit.id}/stats`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  }, [habit]);

  const fetchMonthLogs = useCallback(async () => {
    if (!habit) return;
    try {
      setCalendarLoading(true);
      const lastDay = new Date(year, month + 1, 0).getDate();
      const startDate = formatIso(year, month, 1);
      const endDate = formatIso(year, month, lastDay);

      const res = await fetch(
        `${API_BASE_URL}/api/habits/${habit.id}/logs?startDate=${startDate}&endDate=${endDate}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setMonthLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch month logs", err);
    } finally {
      setCalendarLoading(false);
    }
  }, [habit, year, month]);

  useEffect(() => {
    if (isOpen && habit) {
      fetchStats();
      fetchMonthLogs();
    }
  }, [isOpen, habit, fetchStats, fetchMonthLogs]);

  if (!isOpen || !habit) return null;

  // Month navigation
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleTodayMonth = () => {
    setViewDate(new Date());
  };

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon, ...
  const monthName = viewDate.toLocaleString("default", { month: "long", year: "numeric" });

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const logMap = new Map<string, any>();
  monthLogs.forEach((l) => logMap.set(l.date, l));

  // Monthly stats
  const completedLogsThisMonth = monthLogs.filter((l) => l.isCompleted).length;
  const monthCompletionRate =
    daysInMonth > 0 ? Math.round((completedLogsThisMonth / daysInMonth) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800/60 sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: habit.color }}
            >
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white leading-snug">
                  {habit.title}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {habit.type === "NUMERICAL" ? `Numerical (${habit.unit})` : "Custom Status"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {habit.category || "General"} • Analytics, Streaks & Calendar Heatmap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-zinc-400">Loading analytics...</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Top Streaks & Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Current Streak */}
              <div className="p-3.5 bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10 border border-amber-200/60 dark:border-amber-700/40 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Flame className="w-4 h-4 fill-amber-500/20" /> Current Streak
                </div>
                <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                  {stats?.currentStreak || 0} <span className="text-xs font-normal text-zinc-500">days</span>
                </div>
              </div>

              {/* Best Streak */}
              <div className="p-3.5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/20 dark:to-teal-500/10 border border-emerald-200/60 dark:border-emerald-700/40 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Trophy className="w-4 h-4" /> Best Streak
                </div>
                <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                  {stats?.bestStreak || 0} <span className="text-xs font-normal text-zinc-500">days</span>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  <CheckCircle2 className="w-4 h-4 text-purple-500" /> Success Rate
                </div>
                <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                  {stats?.completionRate || "0%"}
                </div>
              </div>

              {/* Total Logged Days */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  <Calendar className="w-4 h-4 text-blue-500" /> Total Logs
                </div>
                <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                  {stats?.totalLoggedDays || 0} <span className="text-xs font-normal text-zinc-500">days</span>
                </div>
              </div>
            </div>

            {/* Numerical Specific Stats */}
            {habit.type === "NUMERICAL" && stats?.numericalStats && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    <TrendingUp className="w-4 h-4 text-blue-500" /> Numerical Aggregations
                  </div>
                  <span className="text-xs text-zinc-400 font-medium">
                    Daily Goal: {stats.numericalStats.targetValue} {stats.numericalStats.unit}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Sum</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                      {stats.numericalStats.totalSum}{" "}
                      <span className="text-xs font-normal text-zinc-400">{stats.numericalStats.unit}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Daily Average</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                      {stats.numericalStats.dailyAverage}{" "}
                      <span className="text-xs font-normal text-zinc-400">{stats.numericalStats.unit}/day</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Personal Record</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                      {stats.numericalStats.maxValue}{" "}
                      <span className="text-xs font-normal text-zinc-400">{stats.numericalStats.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Status / Enum Distribution */}
            {habit.type === "STATUS" && stats?.statusDistribution && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  <BarChart3 className="w-4 h-4 text-purple-500" /> Status Distribution
                </div>

                {/* Progress bar breakdown */}
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-zinc-200 dark:bg-zinc-800">
                  {stats.statusDistribution.map((item, idx) => (
                    <div
                      key={idx}
                      className="h-full transition-all"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      title={`${item.label}: ${item.count} (${item.percentage}%)`}
                    />
                  ))}
                </div>

                {/* Status Legend Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {stats.statusDistribution.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex-1 truncate font-medium text-zinc-800 dark:text-zinc-200">
                        {item.label}
                      </div>
                      <span className="text-zinc-500 font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Calendar Heatmap with Month Navigation */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
              {/* Calendar Month Selector Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      📅 {monthName}
                    </h3>
                    {isCurrentMonth && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {completedLogsThisMonth} days completed this month ({monthCompletionRate}% rate)
                  </p>
                </div>

                {/* Month Navigator Controls */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl shadow-2xs">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleTodayMonth}
                    className="px-2 py-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Calendar Grid */}
              {calendarLoading ? (
                <div className="py-12 text-center text-xs text-zinc-400">Loading month...</div>
              ) : (
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty slots before first day */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="h-11 rounded-xl bg-zinc-100/40 dark:bg-zinc-900/20 border border-transparent"
                    />
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = formatIso(year, month, dayNum);
                    const log = logMap.get(dateStr);
                    const isTodayDate =
                      today.getFullYear() === year &&
                      today.getMonth() === month &&
                      today.getDate() === dayNum;

                    let cellStyle: React.CSSProperties = {};
                    let badgeColor: string | null = null;
                    let displaySubtext: string | null = null;

                    if (log) {
                      if (habit.type === "STATUS") {
                        if (log.color) {
                          cellStyle = {
                            backgroundColor: `${log.color}20`,
                            borderColor: `${log.color}80`,
                          };
                          badgeColor = log.color;
                        }
                        displaySubtext = log.statusValue;
                      } else if (habit.type === "NUMERICAL") {
                        if (log.isCompleted) {
                          cellStyle = {
                            backgroundColor: `${habit.color}28`,
                            borderColor: habit.color,
                          };
                          badgeColor = habit.color;
                        } else if (log.numericValue !== null && log.numericValue > 0) {
                          cellStyle = {
                            backgroundColor: `${habit.color}12`,
                            borderColor: `${habit.color}50`,
                          };
                          badgeColor = habit.color;
                        }
                        displaySubtext = log.numericValue !== null ? `${log.numericValue}` : null;
                      }
                    }

                    return (
                      <div
                        key={dayNum}
                        style={cellStyle}
                        className={`h-11 rounded-xl p-1.5 flex flex-col justify-between items-center transition-all bg-white dark:bg-zinc-900/90 border ${
                          isTodayDate
                            ? "ring-2 ring-blue-500 border-blue-500 font-bold"
                            : "border-zinc-200/80 dark:border-zinc-800/80"
                        } hover:scale-105 hover:shadow-xs`}
                        title={
                          log
                            ? `${dateStr}: ${
                                habit.type === "NUMERICAL"
                                  ? `${log.numericValue ?? 0} / ${habit.targetValue} ${habit.unit}`
                                  : log.statusValue
                              } ${log.isCompleted ? "✅ Completed" : ""}`
                            : `${dateStr}: No check-in recorded`
                        }
                      >
                        <div className="w-full flex items-center justify-between">
                          <span
                            className={`text-[10px] font-semibold ${
                              isTodayDate
                                ? "text-blue-600 dark:text-blue-400 font-black"
                                : "text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {dayNum}
                          </span>

                          {log?.isCompleted && (
                            <span className="w-3 h-3 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px]">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {/* Bottom value indicator */}
                        {badgeColor && (
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: badgeColor }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
