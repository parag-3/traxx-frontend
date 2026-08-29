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
} from "lucide-react";
import { TimerTarget } from "@/types/habit";

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
      {/* Top Banner: Daily Progress & Summary */}
      <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200/60 dark:border-blue-800/40 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2.5 py-0.5 rounded-full">
                {isToday ? "Today's Agenda" : "Day Planner"}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{selectedDate}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              Daily Action Plan
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-lg">
              Your unified checklist of habits scheduled for today plus custom to-do tasks.
            </p>
          </div>

          {/* Progress Overview Pill */}
          <div className="flex items-center gap-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
            {/* Progress Circular Widget */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-200 dark:text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600 dark:text-blue-400 transition-all duration-500 ease-out"
                  strokeDasharray={`${summary.completionPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-black text-zinc-900 dark:text-white">
                {summary.completionPercentage}%
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-zinc-900 dark:text-white">
                {summary.completedCount} / {summary.totalCount} Completed
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Habits: {summary.habitsCompleted}/{summary.habitsTotal}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Tasks: {summary.tasksCompleted}/{summary.tasksTotal}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Bar & New Task Modal Button */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/90 rounded-2xl p-3 sm:p-4 shadow-sm">
        <form onSubmit={handleQuickAddTask} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Add a task for today (e.g. Finish pitch deck, Buy groceries, Call mechanic)..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="w-full pl-3.5 pr-24 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-colors ${
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={!quickTitle.trim() || submittingQuick}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
            <button
              type="button"
              onClick={onOpenCreateTask}
              className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-medium transition-colors shrink-0"
              title="Open full task creator with time, category & reminders"
            >
              More Options...
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "ALL"
                ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            All ({allItems.length})
          </button>
          <button
            onClick={() => setFilter("HABITS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "HABITS"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            ⚡ Habits ({summary.habitsTotal})
          </button>
          <button
            onClick={() => setFilter("TASKS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "TASKS"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            📋 Tasks ({summary.tasksTotal})
          </button>
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "PENDING"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Pending ({summary.totalCount - summary.completedCount})
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
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
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Task & Habit List */}
      {loading && allItems.length === 0 ? (
        <div className="py-20 text-center text-xs text-zinc-400">Loading daily plan...</div>
      ) : filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            if (item.itemType === "HABIT" && item.habitData) {
              const habit = item.habitData;
              const IconComp = ICON_MAP[habit.icon] || Activity;
              const isNumerical = habit.type === "NUMERICAL";
              const currentVal = habit.todayLog?.numericValue ?? 0;
              const currentStatusVal = habit.todayLog?.statusValue;
              const hasStatusLog = Boolean(currentStatusVal);
              const currentOption = habit.statusOptions.find((o) => o.value === currentStatusVal) || habit.statusOptions[0];
              const isLoggedToday = isNumerical ? (habit.todayLog?.numericValue !== null && currentVal > 0) : hasStatusLog;

              // Frequency label
              let freqLabel = "Every Day";
              if (habit.frequencyType === "WEEKDAYS") freqLabel = "Mon–Fri";
              if (habit.frequencyType === "WEEKENDS") freqLabel = "Sat–Sun";
              if (habit.frequencyType === "CUSTOM_DAYS" && habit.frequencyDays) freqLabel = habit.frequencyDays;
              if (habit.frequencyType === "TIMES_PER_WEEK") freqLabel = `${habit.frequencyTarget}x/week`;

              return (
                <div
                  key={item.id}
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-150 ${
                    item.isCompleted
                      ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/30"
                      : "bg-white dark:bg-zinc-950 border-zinc-200/90 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Habit Quick Toggle Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleQuickToggleHabit(habit)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        item.isCompleted
                          ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                          : "border-2 border-zinc-300 dark:border-zinc-700 hover:border-blue-500 text-transparent"
                      }`}
                      title={item.isCompleted ? "Click to uncheck/reset" : isNumerical ? "Log numerical progress" : "Toggle habit complete"}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    {/* Habit Icon Badge */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: habit.color }}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>

                    {/* Title & Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-semibold text-sm leading-snug truncate ${
                            item.isCompleted
                              ? "text-zinc-600 dark:text-zinc-400 line-through"
                              : "text-zinc-900 dark:text-white"
                          }`}
                        >
                          {habit.title}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                          {habit.category || "Habit"}
                        </span>
                        {/* Frequency Pill */}
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900/60 px-2 py-0.5 rounded-md border border-zinc-200/50 dark:border-zinc-800/50">
                          <Calendar className="w-2.5 h-2.5 text-blue-500" />
                          {freqLabel}
                        </span>
                        {/* Reminder tag */}
                        {habit.reminderEnabled && habit.reminderTime && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md">
                            <Clock className="w-2.5 h-2.5" />
                            {habit.reminderTime}
                          </span>
                        )}
                      </div>

                      {/* Description or Subtitle */}
                      {habit.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-md">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side Habit Actions & Controls */}
                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    {/* Streak Badge */}
                    <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl">
                      <Flame className="w-3.5 h-3.5 fill-amber-500/20" />
                      <span>{habit.currentStreak}d</span>
                    </div>

                    {/* Numerical Controls */}
                    {isNumerical && (
                      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                        <button
                          onClick={() => handleStepNumeric(habit, -1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          title="Decrease"
                        >
                          -
                        </button>
                        <button
                          onClick={() => {
                            setNumericalInputHabit(habit);
                            setNumericalValue(currentVal.toString());
                          }}
                          className="px-2 py-0.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:underline"
                          title="Click to enter custom value"
                        >
                          {currentVal} / {habit.targetValue} {habit.unit}
                        </button>
                        <button
                          onClick={() => handleStepNumeric(habit, 1)}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
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
                        className="px-2.5 py-1 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5"
                        style={{
                          backgroundColor: hasStatusLog && currentOption ? `${currentOption.color}15` : "#94A3B815",
                          borderColor: hasStatusLog && currentOption ? `${currentOption.color}40` : "#94A3B830",
                          color: hasStatusLog && currentOption ? currentOption.color : "#94A3B8",
                        }}
                        title="Click to cycle status (cycles to unlogged at end)"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: hasStatusLog && currentOption ? currentOption.color : "#94A3B8" }}
                        />
                        {hasStatusLog && currentOption ? currentOption.label : "Not Logged"}
                      </button>
                    )}

                    {/* Clear / Reset Button if logged */}
                    {isLoggedToday && (
                      <button
                        onClick={() => handleClearHabitLog(habit)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Clear / Reset today's log"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Timer Launch Button */}
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
                        className="p-1.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                        title="Start Focus Timer for this habit"
                      >
                        <Timer className="w-4 h-4 text-emerald-500" />
                      </button>
                    )}

                    {/* Open Habit Details / Edit */}
                    <button
                      onClick={() => onOpenStats(habit)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                      title="View Stats & Trends"
                    >
                      <Activity className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            if (item.itemType === "TASK" && item.taskData) {
              const task = item.taskData;
              return (
                <div
                  key={item.id}
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-150 ${
                    item.isCompleted
                      ? "bg-zinc-50/60 dark:bg-zinc-950/40 border-zinc-200/50 dark:border-zinc-800/40 opacity-75"
                      : "bg-white dark:bg-zinc-950 border-zinc-200/90 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Task Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        item.isCompleted
                          ? "bg-blue-600 text-white shadow-xs hover:bg-blue-700"
                          : "border-2 border-zinc-300 dark:border-zinc-700 hover:border-blue-500 text-transparent"
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    {/* Task Icon Badge */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
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
                      <CheckSquare className="w-4 h-4" />
                    </div>

                    {/* Title & Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-semibold text-sm leading-snug truncate ${
                            item.isCompleted
                              ? "text-zinc-500 dark:text-zinc-500 line-through"
                              : "text-zinc-900 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            task.priority === "HIGH"
                              ? "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                              : task.priority === "LOW"
                              ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                              : "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Time Spent Badge */}
                        {task.timeSpent !== undefined && task.timeSpent !== null && task.timeSpent > 0 && (
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-blue-200/50 dark:border-blue-900/40">
                            <Timer className="w-2.5 h-2.5" />
                            {task.timeSpent}m
                          </span>
                        )}

                        {/* Category */}
                        {task.category && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                            {task.category}
                          </span>
                        )}

                        {/* Time / Reminder */}
                        {(task.time || task.reminderTime) && (
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded-md">
                            <Clock className="w-2.5 h-2.5 text-blue-500" />
                            {task.time || task.reminderTime}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-md">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    {onOpenTimer && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenTimer({
                            type: "TASK",
                            id: task.id,
                            title: task.title,
                            color: task.priority === "HIGH" ? "#EF4444" : "#3B82F6",
                            currentMinutes: task.timeSpent || 0,
                          })
                        }
                        className="p-1.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                        title="Start Focus Timer for this task"
                      >
                        <Timer className="w-4 h-4 text-blue-500" />
                      </button>
                    )}
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center bg-white dark:bg-zinc-950/60 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto text-zinc-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              {summary.totalCount > 0 && summary.completedCount === summary.totalCount
                ? "🎉 All Done for the Day!"
                : "No items scheduled for this day"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {summary.totalCount > 0 && summary.completedCount === summary.totalCount
                ? "Incredible work! You completed all your habits and tasks for today."
                : "Add a habit or custom task to plan your day and keep your momentum going."}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onOpenCreateTask}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add a Task
            </button>
          </div>
        </div>
      )}

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
