"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { API_BASE_URL } from "@/lib/api";
import { Habit } from "@/types/habit";
import { TrendLineGraph, TimelineDataPoint } from "./trend-line-graph";
import { SkeletonAnalyticsDashboard } from "./skeleton";
import { SpotlightCard } from "./spotlight-card";
import {
  TrendingUp,
  Clock,
  Flame,
  Target,
  Award,
  Calendar,
  Layers,
  Sparkles,
  BarChart2,
  CheckCircle2,
  Activity,
  Zap,
} from "lucide-react";

interface AnalyticsDashboardProps {
  onOpenStatsModal?: (habit: Habit) => void;
  onNavigateToHabits?: () => void;
}

export function AnalyticsDashboard({
  onOpenStatsModal,
  onNavigateToHabits,
}: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"ALL" | "TIME" | "NUMERICAL">("ALL");
  const [selectedHabitId, setSelectedHabitId] = useState<string>("ALL");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/analytics/overview`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics overview", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = analyticsData?.summary || {
    totalHabits: 0,
    totalFocusMinutes: 0,
    totalFocusHours: 0,
    totalNumericalLogsCount: 0,
    overallCompletionRate: 0,
  };

  const timeHabits = analyticsData?.timeHabits || [];
  const numericalHabits = analyticsData?.numericalHabits || [];

  // Combine habits for selection
  const allTrackableHabits = useMemo(() => {
    return [...timeHabits, ...numericalHabits];
  }, [timeHabits, numericalHabits]);

  // Aggregate daily timeline across all Time habits
  const aggregateTimeTimeline = useMemo(() => {
    if (timeHabits.length === 0) return [];
    const dateMap = new Map<string, number>();

    timeHabits.forEach((h: any) => {
      (h.timeline || []).forEach((t: TimelineDataPoint) => {
        const curr = dateMap.get(t.date) || 0;
        dateMap.set(t.date, curr + (t.value || 0));
      });
    });

    return Array.from(dateMap.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [timeHabits]);

  // Aggregate daily timeline across all Numerical habits
  const aggregateNumericalTimeline = useMemo(() => {
    if (numericalHabits.length === 0) return [];
    const dateMap = new Map<string, number>();

    numericalHabits.forEach((h: any) => {
      (h.timeline || []).forEach((t: TimelineDataPoint) => {
        const curr = dateMap.get(t.date) || 0;
        dateMap.set(t.date, curr + (t.value || 0));
      });
    });

    return Array.from(dateMap.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [numericalHabits]);

  // Selected specific habit
  const currentSelectedHabit = useMemo(() => {
    if (selectedHabitId === "ALL") return null;
    return allTrackableHabits.find((h: any) => h.id === selectedHabitId) || null;
  }, [selectedHabitId, allTrackableHabits]);

  if (loading && !analyticsData) {
    return <SkeletonAnalyticsDashboard />;
  }

  const hasAnyData = timeHabits.length > 0 || numericalHabits.length > 0;

  return (
    <div className="space-y-6">
      {/* Top 4 Portfolio Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Focus Time */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.12)"
          className="bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Deep Focus
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {summary.totalFocusHours} <span className="text-sm font-semibold text-zinc-400">hours</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {summary.totalFocusMinutes.toLocaleString()} minutes across {timeHabits.length} time habits
          </p>
        </SpotlightCard>

        {/* Total Numerical Output */}
        <SpotlightCard
          spotlightColor="rgba(59, 130, 246, 0.12)"
          className="bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              Numerical Milestones
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {summary.totalNumericalLogsCount.toLocaleString()}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Total units logged across {numericalHabits.length} quantitative habits
          </p>
        </SpotlightCard>

        {/* Overall Completion Consistency */}
        <SpotlightCard
          spotlightColor="rgba(168, 85, 247, 0.12)"
          className="bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Consistency Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {summary.overallCompletionRate}%
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Average completion across all tracked days
          </p>
        </SpotlightCard>

        {/* Active Tracked Habits */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.12)"
          className="bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl p-5 shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Active Portfolio
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {summary.totalHabits} <span className="text-sm font-semibold text-zinc-400">habits</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {timeHabits.length} Time • {numericalHabits.length} Number
          </p>
        </SpotlightCard>
      </div>

      {!hasAnyData ? (
        <div className="p-12 text-center bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border border-zinc-200/70 dark:border-white/[0.06] rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              No Time or Numerical Habits Created Yet
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Create a Time-based habit (e.g. Deep Work, Reading) or Numerical habit (e.g. Pushups, Water) to see rich multi-chart visualizations (Line, Column Bars, Step Staircase, and Scatter)!
            </p>
          </div>
          {onNavigateToHabits && (
            <button
              onClick={onNavigateToHabits}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:scale-[1.02] transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Zap className="w-4 h-4" /> Create Your First Habit
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Filter & Habit Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/80 dark:bg-[#11141d]/80 border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl shadow-xs">
            {/* Category / Type Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setSelectedTypeFilter("ALL");
                  setSelectedHabitId("ALL");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTypeFilter === "ALL"
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                All Metrics
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTypeFilter("TIME");
                  setSelectedHabitId("ALL");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTypeFilter === "TIME"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                ⏱️ Time Habits ({timeHabits.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTypeFilter("NUMERICAL");
                  setSelectedHabitId("ALL");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTypeFilter === "NUMERICAL"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                📊 Number Habits ({numericalHabits.length})
              </button>
            </div>

            {/* Individual Habit Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">Drilldown:</span>
              <select
                value={selectedHabitId}
                onChange={(e) => setSelectedHabitId(e.target.value)}
                className="px-3 py-1.5 bg-zinc-50 dark:bg-[#151926] border border-zinc-200/70 dark:border-white/[0.08] rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer shadow-xs"
              >
                <option value="ALL">All Habits Combined</option>
                {allTrackableHabits.map((h: any) => (
                  <option key={h.id} value={h.id}>
                    {h.type === "TIME" ? "⏱️" : "📊"} {h.title} ({h.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Specific Habit Selected View */}
          {currentSelectedHabit ? (
            <div className="p-6 bg-white/80 dark:bg-[#11141d]/80 border border-zinc-200/70 dark:border-white/[0.06] rounded-3xl shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-white/[0.04] pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs"
                    style={{ backgroundColor: currentSelectedHabit.color || "#10B981" }}
                  >
                    {currentSelectedHabit.type === "TIME" ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <Target className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                      {currentSelectedHabit.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {currentSelectedHabit.category || "General"} • Started {currentSelectedHabit.startDate} • Streak: {currentSelectedHabit.currentStreak} days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
                    {currentSelectedHabit.completionRate}% Met Target
                  </span>
                </div>
              </div>

              {/* Multi-Format Interactive Visualizer for this Habit */}
              <TrendLineGraph
                data={currentSelectedHabit.timeline || []}
                unit={currentSelectedHabit.type === "TIME" ? "mins" : currentSelectedHabit.unit || "units"}
                color={currentSelectedHabit.color || (currentSelectedHabit.type === "TIME" ? "#10B981" : "#3B82F6")}
                targetValue={currentSelectedHabit.type === "TIME" ? currentSelectedHabit.targetMinutes : currentSelectedHabit.targetValue}
                title={`${currentSelectedHabit.title} — Performance Progression`}
                subtitle="Switch between Line, Column Bars, Step Staircase, and Scatter Bubbles"
                height={260}
                showTimeframes={true}
                showChartTypeSelector={true}
                defaultChartType="LINE"
              />
            </div>
          ) : (
            /* Portfolio Section View */
            <div className="space-y-6">
              {/* TIME HABITS SECTION */}
              {(selectedTypeFilter === "ALL" || selectedTypeFilter === "TIME") && timeHabits.length > 0 && (
                <div className="p-6 bg-white/80 dark:bg-[#11141d]/80 border border-zinc-200/70 dark:border-white/[0.06] rounded-3xl shadow-xs space-y-6">
                  {/* Section Title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                          Time-Based Habits Focus Analytics
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Total minutes invested in deep work and focus sessions
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Aggregate Time Visualizer with Line/Bar/Step/Scatter toggles */}
                  <TrendLineGraph
                    data={aggregateTimeTimeline}
                    unit="mins"
                    color="#10B981"
                    title="Daily Focus Minutes Progression"
                    subtitle="Interactive graph: Line curve, Column bars, Staircase step, or Scatter bubbles"
                    height={240}
                    showTimeframes={true}
                    showChartTypeSelector={true}
                    defaultChartType="LINE"
                  />

                  {/* Individual Time Habit Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2 border-t border-zinc-100 dark:border-white/[0.04]">
                    {timeHabits.map((h: any) => (
                      <div
                        key={h.id}
                        onClick={() => setSelectedHabitId(h.id)}
                        className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-[#151926] border border-zinc-200/60 dark:border-white/[0.06] hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                              style={{ backgroundColor: h.color || "#10B981" }}
                            >
                              <Clock className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                                {h.title}
                              </h4>
                              <p className="text-[10px] text-zinc-400">
                                {h.category || "General"}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200/40 dark:border-emerald-800/30 shrink-0">
                            {h.totalHours} hrs
                          </span>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-0.5">
                          <span>Target: <strong className="text-zinc-800 dark:text-zinc-200">{h.targetMinutes || 0}m</strong></span>
                          <span>Avg: <strong className="text-zinc-800 dark:text-zinc-200">{h.dailyAverageMinutes}m/d</strong></span>
                          <span>Peak: <strong className="text-zinc-800 dark:text-zinc-200">{h.maxMinutes}m</strong></span>
                        </div>

                        {/* Clean Smooth Sparkline Curve */}
                        <div className="h-16 w-full pt-1">
                          <TrendLineGraph
                            data={h.timeline || []}
                            unit="m"
                            color={h.color || "#10B981"}
                            targetValue={h.targetMinutes}
                            height={60}
                            isMini={true}
                            defaultChartType="LINE"
                          />
                        </div>

                        {/* Card Footer Hint */}
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 group-hover:text-emerald-500 transition-colors pt-1 border-t border-zinc-100 dark:border-white/[0.04]">
                          <span>14-day trend</span>
                          <span className="font-semibold">Deep Dive &rarr;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* NUMERICAL HABITS SECTION */}
              {(selectedTypeFilter === "ALL" || selectedTypeFilter === "NUMERICAL") && numericalHabits.length > 0 && (
                <div className="p-6 bg-white/80 dark:bg-[#11141d]/80 border border-zinc-200/70 dark:border-white/[0.06] rounded-3xl shadow-xs space-y-6">
                  {/* Section Title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                          Quantitative & Number Habits Analytics
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Performance curves, velocity averages, and goal milestone attainment
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Aggregate Numerical Visualizer with Chart Type Controls */}
                  <TrendLineGraph
                    data={aggregateNumericalTimeline}
                    unit="units"
                    color="#3B82F6"
                    title="Portfolio Quantitative Velocity"
                    subtitle="Switch between Column Bars, Spline Line, Step Staircase, and Scatter"
                    height={240}
                    showTimeframes={true}
                    showChartTypeSelector={true}
                    defaultChartType="LINE"
                  />

                  {/* Individual Number Habit Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2 border-t border-zinc-100 dark:border-white/[0.04]">
                    {numericalHabits.map((h: any) => (
                      <div
                        key={h.id}
                        onClick={() => setSelectedHabitId(h.id)}
                        className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-[#151926] border border-zinc-200/60 dark:border-white/[0.06] hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                              style={{ backgroundColor: h.color || "#3B82F6" }}
                            >
                              <Target className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">
                                {h.title}
                              </h4>
                              <p className="text-[10px] text-zinc-400">
                                {h.category || "General"}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg border border-blue-200/40 dark:border-blue-800/30 shrink-0">
                            {h.totalSum.toLocaleString()} {h.unit}
                          </span>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-0.5">
                          <span>Target: <strong className="text-zinc-800 dark:text-zinc-200">{h.targetValue} {h.unit}</strong></span>
                          <span>Avg: <strong className="text-zinc-800 dark:text-zinc-200">{h.dailyAverage}</strong></span>
                          <span>Peak: <strong className="text-zinc-800 dark:text-zinc-200">{h.maxValue}</strong></span>
                        </div>

                        {/* Clean Smooth Sparkline Curve */}
                        <div className="h-16 w-full pt-1">
                          <TrendLineGraph
                            data={h.timeline || []}
                            unit={h.unit}
                            color={h.color || "#3B82F6"}
                            targetValue={h.targetValue}
                            height={60}
                            isMini={true}
                            defaultChartType="LINE"
                          />
                        </div>

                        {/* Card Footer Hint */}
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 group-hover:text-blue-500 transition-colors pt-1 border-t border-zinc-100 dark:border-white/[0.04]">
                          <span>14-day trend</span>
                          <span className="font-semibold">Deep Dive &rarr;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

