"use client";

import { useState, useEffect, useCallback } from "react";
import { Habit, Task, DailyPlanResponse, DailyPlanItem } from "@/types/habit";
import { API_BASE_URL } from "@/lib/api";
import {
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Clock,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  Sparkles,
  BookOpen,
  Dumbbell,
  Droplets,
  Heart,
  Target,
  Brain,
  Coffee,
  Trophy,
  Activity,
  CheckSquare,
  Filter,
  Search,
  Check,
  RotateCcw,
  X,
  Timer,
  Play,
  Zap,
} from "lucide-react";
import { TimerTarget } from "@/types/habit";
import { SpotlightCard } from "./spotlight-card";
import { SkeletonPlannerItem } from "./skeleton";

interface DailyPlannerProps {
  selectedDate: string;
  onDateShift: (delta: number) => void;
  onOpenCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onEditHabit: (habit: Habit) => void;
  onOpenStats: (habit: Habit) => void;
  onHabitsUpdated?: () => void;
  onOpenTimer?: (target: TimerTarget) => void;
}

const ICON_MAP: Record<string, any> = {
  CheckCircle: CheckCircle2,
  BookOpen,
  Dumbbell,
  Droplets,
  Sparkles,
  Heart,
  Flame,
  Target,
  Brain,
  Coffee,
  Trophy,
};

export function DailyPlanner({
  selectedDate,
  onDateShift,
  onOpenCreateTask,
  onEditTask,
  onEditHabit,
  onOpenStats,
  onHabitsUpdated,
  onOpenTimer,
}: DailyPlannerProps) {
  const [data, setData] = useState<DailyPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickPriority, setQuickPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [quickTime, setQuickTime] = useState("");
  const [filter, setFilter] = useState<"ALL" | "HABITS" | "TASKS" | "PENDING" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [submittingQuick, setSubmittingQuick] = useState(false);
  const [sidebarFocusMinutes, setSidebarFocusMinutes] = useState(25);

  // Numerical entry inline modal/state
  const [numericalInputHabit, setNumericalInputHabit] = useState<Habit | null>(null);
  const [numericalValue, setNumericalValue] = useState<string>("");

  const fetchDailyPlan = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/daily-plan?date=${selectedDate}`, {
        credentials: "include",
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error("Failed to fetch daily plan", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDailyPlan();
  }, [fetchDailyPlan]);

  const getTodayIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const isToday = selectedDate === getTodayIso();

  // Quick Add Task
  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || submittingQuick) return;

    try {
      setSubmittingQuick(true);
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: quickTitle.trim(),
          date: selectedDate,
          priority: quickPriority,
          time: quickTime || null,
          category: "General",
        }),
      });

      if (res.ok) {
        setQuickTitle("");
        setQuickTime("");
        fetchDailyPlan();
      }
    } catch (err) {
      console.error("Failed to quick add task", err);
    } finally {
      setSubmittingQuick(false);
    }
  };

  // Toggle Custom Task completion
  const handleToggleTask = async (task: Task) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          isCompleted: !task.isCompleted,
        }),
      });
      if (res.ok) {
        fetchDailyPlan();
      }
    } catch (err) {
      console.error("Toggle task error", err);
    }
  };

  // Delete Custom Task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchDailyPlan();
      }
    } catch (err) {
      console.error("Delete task error", err);
    }
  };

  // Log / Toggle Habit from planner
  const handleLogHabit = async (
    habit: Habit,
    payload: { numericValue?: number | null; statusValue?: string | null; isCompleted?: boolean; clear?: boolean }
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${habit.id}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          date: selectedDate,
          ...payload,
        }),
      });
      if (res.ok) {
        fetchDailyPlan();
        if (onHabitsUpdated) onHabitsUpdated();
      }
    } catch (err) {
      console.error("Log habit error", err);
    }
  };

  // Clear habit log
  const handleClearHabitLog = (habit: Habit) => {
    handleLogHabit(habit, { clear: true, numericValue: null, statusValue: null });
  };

  // Quick toggle habit complete (for status or quick tap)
  const handleQuickToggleHabit = (habit: Habit) => {
    if (habit.type === "NUMERICAL") {
      setNumericalInputHabit(habit);
      setNumericalValue(habit.todayLog?.numericValue?.toString() || habit.targetValue?.toString() || "");
      return;
    }

    if (habit.type === "STATUS" && habit.statusOptions.length > 0) {
      const isCurrentlyDone = habit.todayLog?.isCompleted;
      if (isCurrentlyDone) {
        // If already done, toggle to clear / unlogged
        handleClearHabitLog(habit);
      } else {
        // Mark as completed option
        const completedOpt = habit.statusOptions.find((o) => o.isCompleted) || habit.statusOptions[habit.statusOptions.length - 1];
        handleLogHabit(habit, { statusValue: completedOpt?.value });
      }
    }
  };

  // Cycle status option
  const handleCycleStatus = (habit: Habit) => {
    if (habit.statusOptions.length === 0) return;
    const currentVal = habit.todayLog?.statusValue;
    if (!currentVal) {
      // First state
      handleLogHabit(habit, { statusValue: habit.statusOptions[0]?.value });
      return;
    }
    const currentIdx = habit.statusOptions.findIndex((o) => o.value === currentVal);
    if (currentIdx === habit.statusOptions.length - 1) {
      // End of list -> cycle to unlogged/clear
      handleClearHabitLog(habit);
    } else {
      const nextOpt = habit.statusOptions[currentIdx + 1];
      if (nextOpt) {
        handleLogHabit(habit, { statusValue: nextOpt.value });
      }
    }
  };

  // Numerical Step
  const handleStepNumeric = (habit: Habit, delta: number) => {
    const cur = habit.todayLog?.numericValue ?? 0;
    const nextVal = Math.max(0, cur + delta);
    if (nextVal === 0 && delta < 0) {
      handleClearHabitLog(habit);
    } else {
      handleLogHabit(habit, { numericValue: nextVal });
    }
  };

  const handleSaveNumericalModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numericalInputHabit) return;
    const num = parseFloat(numericalValue);
    if (!isNaN(num)) {
      if (num <= 0) {
        handleClearHabitLog(numericalInputHabit);
      } else {
        handleLogHabit(numericalInputHabit, { numericValue: num });
      }
      setNumericalInputHabit(null);
      setNumericalValue("");
    }
  };

  const summary = data?.summary || {
    totalCount: 0,
    completedCount: 0,
    completionPercentage: 0,
    habitsTotal: 0,
    habitsCompleted: 0,
    tasksTotal: 0,
    tasksCompleted: 0,
  };

  const allItems = data?.allItems || [];

  // Filter items
  const filteredItems = allItems.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCategory = item.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchCategory) return false;
    }

    if (filter === "HABITS") return item.itemType === "HABIT";
    if (filter === "TASKS") return item.itemType === "TASK";
    if (filter === "PENDING") return !item.isCompleted;
    if (filter === "COMPLETED") return item.isCompleted;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 2-Column Responsive Workspace Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick Add Bar, Filter Controls & Items Checklist (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Quick Add Bar */}
          <div className="bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl p-3.5 sm:p-4 shadow-xs">
            <form onSubmit={handleQuickAddTask} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Add a task for today (e.g. Finish pitch deck, Buy groceries)..."
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="w-full pl-4 pr-24 py-2.5 bg-zinc-50/80 dark:bg-[#151926] border border-zinc-200/60 dark:border-white/[0.06] rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                />
                {/* Quick Priority Toggle inside input */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setQuickPriority(
                        quickPriority === "LOW" ? "MEDIUM" : quickPriority === "MEDIUM" ? "HIGH" : "LOW"
                      )
                    }
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      quickPriority === "HIGH"
                        ? "bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400"
                        : quickPriority === "MEDIUM"
                        ? "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                        : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                    }`}
                    title="Click to cycle priority"
                  >
                    {quickPriority}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={!quickTitle.trim() || submittingQuick}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
                <button
                  type="button"
                  onClick={onOpenCreateTask}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200/70 dark:border-white/[0.06] hover:bg-zinc-100 dark:hover:bg-[#181d2a] text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm font-medium transition-colors shrink-0 cursor-pointer"
                  title="Open full task creator with time, category & reminders"
                >
                  More Options...
                </button>
              </div>
            </form>
          </div>

          {/* Filter Tabs & Search Bar with generous spacing */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/80 dark:bg-[#11141d]/80 border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl shadow-xs">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  filter === "ALL"
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                All ({allItems.length})
              </button>
              <button
                onClick={() => setFilter("HABITS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  filter === "HABITS"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                ⚡ Habits ({summary.habitsTotal})
              </button>
              <button
                onClick={() => setFilter("TASKS")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  filter === "TASKS"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                📋 Tasks ({summary.tasksTotal})
              </button>
              <button
                onClick={() => setFilter("PENDING")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  filter === "PENDING"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Pending ({summary.totalCount - summary.completedCount})
              </button>
              <button
                onClick={() => setFilter("COMPLETED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  filter === "COMPLETED"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Done ({summary.completedCount})
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/80 dark:bg-[#12151f] border border-zinc-200/70 dark:border-white/[0.06] rounded-xl text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-xs"
              />
            </div>
          </div>

          {/* Unified To-Do Items List with SpotlightCard */}
          {loading && allItems.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonPlannerItem key={i} />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                if (item.itemType === "HABIT" && item.habitData) {
                  const habit = item.habitData;
                  const IconComp = ICON_MAP[habit.icon] || Sparkles;
                  const isNumerical = habit.type === "NUMERICAL";
                  const currentVal = habit.todayLog?.numericValue ?? 0;
                  const currentStatusVal = habit.todayLog?.statusValue;
                  const hasStatusLog = Boolean(currentStatusVal);
                  const currentOption = habit.statusOptions.find((o) => o.value === currentStatusVal) || habit.statusOptions[0];
                  const isLoggedToday = isNumerical ? (habit.todayLog?.numericValue !== null && currentVal > 0) : hasStatusLog;

                  let freqLabel = "Every Day";
                  if (habit.frequencyType === "WEEKDAYS") freqLabel = "Mon–Fri";
                  if (habit.frequencyType === "WEEKENDS") freqLabel = "Sat–Sun";
                  if (habit.frequencyType === "CUSTOM_DAYS" && habit.frequencyDays) freqLabel = habit.frequencyDays;
                  if (habit.frequencyType === "TIMES_PER_WEEK") freqLabel = `${habit.frequencyTarget}x/week`;

                  return (
                    <SpotlightCard
                      key={item.id}
                      spotlightColor={`${habit.color}20`}
                      className={`group p-3 sm:p-3.5 rounded-2xl border transition-all duration-150 ${
                        item.isCompleted
                          ? "bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-200/50 dark:border-emerald-800/30"
                          : "bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border-zinc-200/70 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.12] shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2.5 w-full">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Habit Quick Toggle Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleQuickToggleHabit(habit)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              item.isCompleted
                                ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                                : "border-2 border-zinc-300 dark:border-zinc-700 hover:border-blue-500 text-transparent"
                            }`}
                            title={item.isCompleted ? "Click to uncheck/reset" : isNumerical ? "Log numerical progress" : "Toggle habit complete"}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>

                          {/* Habit Icon Badge */}
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: habit.color }}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                          </div>

                          {/* Title & Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`font-semibold text-xs sm:text-sm leading-tight truncate ${
                                  item.isCompleted
                                    ? "text-zinc-500 dark:text-zinc-500 line-through"
                                    : "text-zinc-900 dark:text-white"
                                }`}
                              >
                                {habit.title}
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-[#181d2c] text-zinc-600 dark:text-zinc-300">
                                {habit.category || "Habit"}
                              </span>
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 bg-zinc-50 dark:bg-[#151926] px-1.5 py-0.5 rounded-md border border-zinc-200/50 dark:border-white/[0.06]">
                                <Calendar className="w-2.5 h-2.5 text-blue-500" />
                                {freqLabel}
                              </span>
                              {habit.reminderEnabled && habit.reminderTime && (
                                <span className="text-[9px] text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md">
                                  <Clock className="w-2.5 h-2.5" />
                                  {habit.reminderTime}
                                </span>
                              )}
                            </div>

                            {habit.description && (
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-md">
                                {habit.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right Side Habit Controls */}
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg">
                            <Flame className="w-3 h-3 fill-amber-500/20" />
                            <span>{habit.currentStreak}d</span>
                          </div>

                          {/* Numerical Controls */}
                          {isNumerical && (
                            <div className="flex items-center gap-0.5 bg-zinc-100/80 dark:bg-[#151926] p-0.5 rounded-lg border border-zinc-200/60 dark:border-white/[0.06]">
                              <button
                                onClick={() => handleStepNumeric(habit, -1)}
                                className="w-5 h-5 rounded-md bg-white dark:bg-[#1e2334] flex items-center justify-center text-[10px] font-bold hover:bg-zinc-200 dark:hover:bg-[#252b40] transition-colors"
                                title="Decrease"
                              >
                                -
                              </button>
                              <button
                                onClick={() => {
                                  setNumericalInputHabit(habit);
                                  setNumericalValue(currentVal.toString());
                                }}
                                className="px-1.5 py-0.5 text-[11px] font-bold text-zinc-800 dark:text-zinc-200 hover:underline"
                                title="Click to enter custom value"
                              >
                                {currentVal}/{habit.targetValue} {habit.unit}
                              </button>
                              <button
                                onClick={() => handleStepNumeric(habit, 1)}
                                className="w-5 h-5 rounded-md bg-white dark:bg-[#1e2334] flex items-center justify-center text-[10px] font-bold hover:bg-zinc-200 dark:hover:bg-[#252b40] transition-colors"
                                title="Increase"
                              >
                                +
                              </button>
                            </div>
                          )}

                          {/* Status Enum Controls */}
                          {!isNumerical && habit.statusOptions.length > 0 && (
                            <button
                              onClick={() => handleCycleStatus(habit)}
                              className="px-2 py-0.5 text-[11px] font-semibold rounded-lg border transition-colors flex items-center gap-1 cursor-pointer"
                              style={{
                                backgroundColor: hasStatusLog && currentOption ? `${currentOption.color}15` : "#94A3B815",
                                borderColor: hasStatusLog && currentOption ? `${currentOption.color}40` : "#94A3B830",
                                color: hasStatusLog && currentOption ? currentOption.color : "#94A3B8",
                              }}
                              title="Click to cycle status"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: hasStatusLog && currentOption ? currentOption.color : "#94A3B8" }}
                              />
                              {hasStatusLog && currentOption ? currentOption.label : "Not Logged"}
                            </button>
                          )}

                          {isLoggedToday && (
                            <button
                              onClick={() => handleClearHabitLog(habit)}
                              className="p-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-[#181d2a] rounded-lg transition-colors cursor-pointer"
                              title="Clear / Reset today's log"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}

                          {onOpenTimer && (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenTimer({
                                  type: "HABIT",
                                  id: habit.id,
                                  title: habit.title,
                                  color: habit.color,
                                  targetMinutes: habit.type === "TIME" ? (habit.targetValue || 25) : 25,
                                  currentMinutes: currentVal,
                                })
                              }
                              className="p-1 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Start Focus Timer for this habit"
                            >
                              <Timer className="w-3.5 h-3.5 text-emerald-500" />
                            </button>
                          )}

                          <button
                            onClick={() => onOpenStats(habit)}
                            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#181d2a] rounded-lg transition-colors cursor-pointer"
                            title="View Stats & Trends"
                          >
                            <Activity className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </SpotlightCard>
                  );
                }

                if (item.itemType === "TASK" && item.taskData) {
                  const task = item.taskData;
                  return (
                    <SpotlightCard
                      key={item.id}
                      spotlightColor={task.priority === "HIGH" ? "rgba(239, 68, 68, 0.12)" : "rgba(59, 130, 246, 0.12)"}
                      className={`group p-3 sm:p-3.5 rounded-2xl border transition-all duration-150 ${
                        item.isCompleted
                          ? "bg-zinc-50/50 dark:bg-[#11141d]/40 border-zinc-200/50 dark:border-white/[0.04] opacity-75"
                          : "bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border-zinc-200/70 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/[0.12] shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2.5 w-full">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              item.isCompleted
                                ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700"
                                : "border-2 border-zinc-300 dark:border-zinc-700 hover:border-blue-500 text-transparent"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>

                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                            style={{
                              backgroundColor:
                                task.priority === "HIGH"
                                    ? "#FEE2E2"
                                  : task.priority === "LOW"
                                  ? "#D1FAE5"
                                  : "#DBEAFE",
                              color:
                                task.priority === "HIGH"
                                  ? "#DC2626"
                                  : task.priority === "LOW"
                                  ? "#059669"
                                  : "#2563EB",
                            }}
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`font-semibold text-xs sm:text-sm leading-tight truncate ${
                                  item.isCompleted
                                    ? "text-zinc-500 dark:text-zinc-500 line-through"
                                    : "text-zinc-900 dark:text-white"
                                }`}
                              >
                                {task.title}
                              </span>

                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                                  task.priority === "HIGH"
                                    ? "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                                    : task.priority === "LOW"
                                    ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                                    : "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                                }`}
                              >
                                {task.priority}
                              </span>

                              {task.timeSpent !== undefined && task.timeSpent !== null && task.timeSpent > 0 && (
                                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-blue-200/50 dark:border-blue-900/40">
                                  <Timer className="w-2.5 h-2.5" />
                                  {task.timeSpent}m
                                </span>
                              )}

                              {task.category && (
                                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-[#181d2c] text-zinc-600 dark:text-zinc-300">
                                  {task.category}
                                </span>
                              )}

                              {(task.time || task.reminderTime) && (
                                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 bg-zinc-50 dark:bg-[#151926] px-1.5 py-0.5 rounded-md border border-zinc-200/50 dark:border-white/[0.06]">
                                  <Clock className="w-2.5 h-2.5 text-blue-500" />
                                  {task.time || task.reminderTime}
                                </span>
                              )}
                            </div>

                            {task.description && (
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-md">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {onOpenTimer && (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenTimer({
                                  type: "TASK",
                                  id: task.id,
                                  title: task.title,
                                  color: "#3B82F6",
                                  targetMinutes: 25,
                                  currentMinutes: task.timeSpent || 0,
                                })
                              }
                              className="p-1 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Start Focus Timer for this task"
                            >
                              <Timer className="w-3.5 h-3.5 text-blue-500" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onEditTask(task)}
                            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#181d2a] rounded-lg transition-colors cursor-pointer"
                            title="Edit task"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </SpotlightCard>
                  );
                }

                return null;
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="py-12 text-center bg-white/60 dark:bg-[#11141d]/60 border border-dashed border-zinc-200 dark:border-white/[0.08] rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-[#151926] flex items-center justify-center mx-auto text-zinc-400">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  No items in this filter
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-xs mx-auto">
                  {filter === "ALL"
                    ? "Add a task or schedule habits to start tracking today's progress."
                    : `No items currently matching the ${filter.toLowerCase()} filter.`}
                </p>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenCreateTask}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Task
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Clean, Minimal Sticky Sidebar Hub (4 cols) */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          {/* 1. Daily Progress Widget */}
          <SpotlightCard
            spotlightColor="rgba(59, 130, 246, 0.10)"
            className="bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl p-5 sm:p-6 shadow-xs"
          >
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                    {isToday ? "Today's Agenda" : "Day Overview"}
                  </span>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mt-0.5">
                    Daily Progress
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
                  {summary.completionPercentage}% Done
                </span>
              </div>

              {/* Hero Progress Summary */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {summary.completedCount} <span className="text-sm font-semibold text-zinc-400">of {summary.totalCount} completed</span>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {summary.totalCount === 0
                      ? "No items scheduled for today"
                      : summary.completedCount === summary.totalCount
                      ? "✨ All tasks & habits finished!"
                      : `${summary.totalCount - summary.completedCount} items left to complete`}
                  </div>
                </div>

                {/* Minimal Circular Progress Gauge */}
                <div className="relative w-13 h-13 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-zinc-100 dark:text-white/[0.06]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500 dark:text-emerald-400 transition-all duration-500 ease-out"
                      strokeDasharray={`${summary.completionPercentage}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-zinc-900 dark:text-white">
                    {summary.completionPercentage}%
                  </span>
                </div>
              </div>

              {/* Minimal Inline Breakdown Rows */}
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-white/[0.04]">
                {/* Habits Row */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> Habits
                    </span>
                    <span className="text-zinc-900 dark:text-white font-bold">
                      {summary.habitsCompleted} / {summary.habitsTotal}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                      style={{
                        width: summary.habitsTotal > 0 ? `${(summary.habitsCompleted / summary.habitsTotal) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>

                {/* Tasks Row */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" /> Tasks
                    </span>
                    <span className="text-zinc-900 dark:text-white font-bold">
                      {summary.tasksCompleted} / {summary.tasksTotal}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-white/[0.05] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full transition-all duration-300 rounded-full"
                      style={{
                        width: summary.tasksTotal > 0 ? `${(summary.tasksCompleted / summary.tasksTotal) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* 2. Sleek Focus Countdown Widget */}
          {onOpenTimer && (
            <SpotlightCard
              spotlightColor="rgba(16, 185, 129, 0.10)"
              className="bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl p-5 sm:p-6 shadow-xs"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-xs">
                      <Timer className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                        Focus Countdown
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Pomodoro & deep work sessions
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
                    {sidebarFocusMinutes}m
                  </span>
                </div>

                {/* Floating Preset Pills with Clean Negative Space */}
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {[15, 25, 30, 45, 60].map((mins) => {
                    const isActive = sidebarFocusMinutes === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setSidebarFocusMinutes(mins)}
                        className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                          isActive
                            ? "bg-emerald-500/15 dark:bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30 shadow-xs"
                            : "bg-zinc-50/60 dark:bg-white/[0.03] border-zinc-200/60 dark:border-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.08]"
                        }`}
                      >
                        {mins}m
                      </button>
                    );
                  })}
                </div>

                {/* Start Session Action Button with Generous Top Gap */}
                <div className="pt-2">
                  <button
                    onClick={() =>
                      onOpenTimer({
                        type: "GENERIC",
                        id: "quick-focus",
                        title: "Deep Work Focus Session",
                        color: "#10B981",
                        targetMinutes: sidebarFocusMinutes,
                        currentMinutes: 0,
                      })
                    }
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Start {sidebarFocusMinutes}-Min Timer
                  </button>
                </div>
              </div>
            </SpotlightCard>
          )}

          {/* 3. Consistency & Streak Insight Card */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#11141d]/60 border border-zinc-200/60 dark:border-white/[0.05] shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500/20" />
              <span>Daily Consistency Tip</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              Small consistent habits build compounding momentum. Complete your highest priority focus task first!
            </p>
          </div>
        </div>
      </div>

      {/* Numerical Log Modal */}
      {numericalInputHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Log {numericalInputHabit.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Target: {numericalInputHabit.targetValue} {numericalInputHabit.unit}
              </p>
            </div>

            <form onSubmit={handleSaveNumericalModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Amount Completed ({numericalInputHabit.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  required
                  placeholder={`e.g. ${numericalInputHabit.targetValue}`}
                  value={numericalValue}
                  onChange={(e) => setNumericalValue(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClearHabitLog(numericalInputHabit);
                    setNumericalInputHabit(null);
                    setNumericalValue("");
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset to 0
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNumericalInputHabit(null)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
