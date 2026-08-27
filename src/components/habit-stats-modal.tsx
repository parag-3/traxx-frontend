"use client";

import { useEffect, useState } from "react";
import { Habit, HabitStats } from "@/types/habit";
import { X, Flame, Trophy, Calendar, CheckCircle2, TrendingUp, BarChart3, Activity } from "lucide-react";

interface HabitStatsModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HabitStatsModal({ habit, isOpen, onClose }: HabitStatsModalProps) {
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [monthLogs, setMonthLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !habit) return;

    setLoading(true);
    // Fetch stats
    const fetchStats = fetch(`http://localhost:3001/api/habits/${habit.id}/stats`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null));

    // Fetch month logs for calendar view
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    const fetchLogs = fetch(
      `http://localhost:3001/api/habits/${habit.id}/logs?startDate=${startOfMonth}&endDate=${endOfMonth}`,
      { credentials: "include" }
    ).then((r) => (r.ok ? r.json() : { logs: [] }));

    Promise.all([fetchStats, fetchLogs])
      .then(([statsData, logsData]) => {
        if (statsData) setStats(statsData);
        if (logsData?.logs) setMonthLogs(logsData.logs);
      })
      .finally(() => setLoading(false));
  }, [isOpen, habit]);

  if (!isOpen || !habit) return null;

  // Build calendar matrix for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  const logMap = new Map<string, any>();
  monthLogs.forEach((l) => logMap.set(l.date, l));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800/60 sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: habit.color }}
            >
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{habit.title}</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {habit.type === "NUMERICAL" ? `Numerical (${habit.unit})` : "Custom Status"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {habit.category || "General"} • Analytics & History
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-zinc-400">Loading analytics...</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Top Streaks & Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Current Streak */}
              <div className="p-3.5 bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10 border border-amber-200/60 dark:border-amber-700/40 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Flame className="w-4 h-4" /> Current Streak
                </div>
                <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                  {stats?.currentStreak || 0} <span className="text-xs font-normal text-zinc-500">days</span>
                </div>
              </div>

              {/* Best Streak */}
              <div className="p-3.5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/20 dark:to-teal-500/10 border border-emerald-200/60 dark:border-emerald-700/40 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Trophy className="w-4 h-4" /> Best Streak
                </div>
                <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                  {stats?.bestStreak || 0} <span className="text-xs font-normal text-zinc-500">days</span>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  <CheckCircle2 className="w-4 h-4" /> Success Rate
                </div>
                <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                  {stats?.completionRate || "0%"}
                </div>
              </div>

              {/* Total Logged Days */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  <Calendar className="w-4 h-4" /> Total Check-ins
                </div>
                <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                  {stats?.totalLoggedDays || 0} <span className="text-xs font-normal text-zinc-500">logs</span>
                </div>
              </div>
            </div>

            {/* Numerical Specific Stats */}
            {habit.type === "NUMERICAL" && stats?.numericalStats && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    <TrendingUp className="w-4 h-4 text-blue-500" /> Numerical Aggregations
                  </div>
                  <span className="text-xs text-zinc-400">
                    Daily Goal: {stats.numericalStats.targetValue} {stats.numericalStats.unit}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Total Sum</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                      {stats.numericalStats.totalSum}{" "}
                      <span className="text-xs font-normal text-zinc-400">{stats.numericalStats.unit}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Daily Average</div>
                    <div className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                      {stats.numericalStats.dailyAverage}{" "}
                      <span className="text-xs font-normal text-zinc-400">{stats.numericalStats.unit}/day</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Personal Best</div>
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
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
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
                      className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs"
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

            {/* Calendar Heatmap */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  📅 {monthName} Heatmap
                </span>
                <span className="text-[11px] text-zinc-400">Daily check-in logs</span>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-zinc-400">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty slots before first day */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10 rounded-lg bg-transparent" />
                ))}

                {/* Month days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  const log = logMap.get(dateStr);
                  const isToday = now.getDate() === dayNum && now.getMonth() === month;

                  let cellBg = "bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800";
                  let cellStyle: React.CSSProperties = {};

                  if (log) {
                    if (habit.type === "STATUS" && log.color) {
                      cellStyle = { backgroundColor: `${log.color}25`, borderColor: log.color };
                    } else if (habit.type === "NUMERICAL") {
                      if (log.isCompleted) {
                        cellStyle = { backgroundColor: `${habit.color}35`, borderColor: habit.color };
                      } else if (log.numericValue) {
                        cellStyle = { backgroundColor: `${habit.color}15`, borderColor: `${habit.color}60` };
                      }
                    }
                  }

                  return (
                    <div
                      key={dayNum}
                      style={cellStyle}
                      className={`h-10 rounded-lg p-1 flex flex-col justify-between items-center transition-all ${cellBg} ${
                        isToday ? "ring-2 ring-blue-500" : ""
                      }`}
                      title={
                        log
                          ? `${dateStr}: ${
                              habit.type === "NUMERICAL"
                                ? `${log.numericValue} ${habit.unit}`
                                : log.statusValue
                            }`
                          : dateStr
                      }
                    >
                      <span className={`text-[10px] font-medium ${isToday ? "text-blue-500 font-bold" : "text-zinc-400"}`}>
                        {dayNum}
                      </span>
                      {log && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              habit.type === "STATUS" && log.color
                                ? log.color
                                : log.isCompleted
                                ? habit.color
                                : "#94A3B8",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
