"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Habit, Task, TimerTarget } from "@/types/habit";
import { API_BASE_URL } from "@/lib/api";
import { HabitCard } from "@/components/habit-card";
import { CreateHabitModal } from "@/components/create-habit-modal";
import { CreateTaskModal } from "@/components/create-task-modal";
import { HabitStatsModal } from "@/components/habit-stats-modal";
import { DailyPlanner } from "@/components/daily-planner";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { ReminderBanner } from "@/components/reminder-banner";
import { DateNavigator } from "@/components/date-navigator";
import { TimerModal } from "@/components/timer-modal";
import { SkeletonHabitCard } from "@/components/skeleton";
import { Logo } from "@/components/logo";
import {
  Plus,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  Zap,
  ListTodo,
  LayoutGrid,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Active Main View Tab
  const [activeTab, setActiveTab] = useState<"PLANNER" | "HABITS" | "ANALYTICS">("PLANNER");

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "TIME" | "NUMERICAL" | "STATUS">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Selected calendar date (defaults to today)
  const getTodayIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso());

  // Modals state
  const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [statsHabit, setStatsHabit] = useState<Habit | null>(null);

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [timerTarget, setTimerTarget] = useState<TimerTarget | null>(null);

  // Fetch habits
  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/habits?date=${selectedDate}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (err) {
      console.error("Failed to fetch habits", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user, fetchHabits]);

  // Date Navigation handler
  const handleDateShift = (deltaDays: number) => {
    const parts = selectedDate.split("-").map(Number);
    const d = new Date(Date.UTC(parts[0] || 1970, (parts[1] || 1) - 1, parts[2] || 1));
    d.setUTCDate(d.getUTCDate() + deltaDays);
    const newDateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    setSelectedDate(newDateStr);
  };

  // Delete habit
  const handleDeleteHabit = async (habitId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        fetchHabits();
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center font-sans text-zinc-400">
        Loading traxx...
      </div>
    );
  }

  // Signed out state
  if (!user) {
    return (
      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 font-sans">
        {/* Ambient glow in background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[500px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 rounded-full blur-3xl opacity-70" />
        </div>

        <div className="relative flex flex-col items-center text-center max-w-md w-full p-8 bg-white dark:bg-[#11141d]/90 backdrop-blur-xl border border-zinc-200/80 dark:border-white/[0.08] rounded-3xl shadow-2xl space-y-6">
          <Logo size="xl" showText={false} />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              Welcome to <span className="text-zinc-900 dark:text-white">tra</span><span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 bg-clip-text text-transparent">xx</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Your unified daily to-do planner, focus countdown timer & habit tracker with customizable schedules, reminders, and streaks.
            </p>
          </div>
          <div className="w-full pt-2">
            <button
              onClick={() => router.push("/login")}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Sign In to Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Compute metrics for habits overview
  const totalHabits = habits.length;
  const scheduledTodayHabits = habits.filter((h) => h.isScheduledToday !== false);
  const completedToday = habits.filter((h) => h.todayLog?.isCompleted).length;
  const completionRate = scheduledTodayHabits.length > 0 ? Math.round((completedToday / scheduledTodayHabits.length) * 100) : 0;
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

  // Filter habits for habit grid view
  const categories = Array.from(new Set(habits.map((h) => h.category || "General")));
  const filteredHabits = habits.filter((h) => {
    if (filter !== "ALL" && h.type !== filter) return false;
    if (selectedCategory !== "ALL" && (h.category || "General") !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] font-sans text-zinc-900 dark:text-zinc-100">
      <main className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 space-y-6">
        {/* Top App Header: Navigation Tabs & Create Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main View Mode Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-zinc-200/70 dark:bg-[#12151f] p-1.5 rounded-2xl w-fit border border-zinc-200/50 dark:border-white/[0.08] shadow-xs flex-wrap">
            <button
              onClick={() => setActiveTab("PLANNER")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "PLANNER"
                  ? "bg-white dark:bg-[#1b202e] text-blue-600 dark:text-cyan-400 shadow-sm border border-transparent dark:border-white/[0.08]"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>Today&apos;s To-Do Planner</span>
            </button>
            <button
              onClick={() => setActiveTab("HABITS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "HABITS"
                  ? "bg-white dark:bg-[#1b202e] text-blue-600 dark:text-cyan-400 shadow-sm border border-transparent dark:border-white/[0.08]"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Habits Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab("ANALYTICS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "ANALYTICS"
                  ? "bg-white dark:bg-[#1b202e] text-emerald-600 dark:text-emerald-400 shadow-sm border border-transparent dark:border-white/[0.08]"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analytics & Trends</span>
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2.5">
            {activeTab === "PLANNER" && (
              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsCreateTaskOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            )}
            <button
              onClick={() => {
                setEditingHabit(null);
                setIsCreateHabitOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Habit
            </button>
          </div>
        </div>

        {/* Date Navigator & Reminders shown on Planner & Habits views */}
        {activeTab !== "ANALYTICS" && (
          <>
            <DateNavigator
              selectedDate={selectedDate}
              onSelectDate={(newDate) => setSelectedDate(newDate)}
              refreshTrigger={habits}
            />
            <ReminderBanner selectedDate={selectedDate} onRefresh={fetchHabits} />
          </>
        )}

        {/* VIEW 1: TODAY'S UNIFIED TO-DO PLANNER */}
        {activeTab === "PLANNER" ? (
          <DailyPlanner
            selectedDate={selectedDate}
            onDateShift={handleDateShift}
            onOpenCreateTask={() => {
              setEditingTask(null);
              setIsCreateTaskOpen(true);
            }}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsCreateTaskOpen(true);
            }}
            onEditHabit={(habit) => {
              setEditingHabit(habit);
              setIsCreateHabitOpen(true);
            }}
            onOpenStats={(habit) => setStatsHabit(habit)}
            onHabitsUpdated={fetchHabits}
            onOpenTimer={(target) => setTimerTarget(target)}
          />
        ) : activeTab === "HABITS" ? (
          /* VIEW 2: HABITS DASHBOARD & METRICS */
          <div className="space-y-7">
            {/* Overview Stats Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-[#11141d]/90 border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                  <span>Total Habits</span>
                  <Layers className="w-4 h-4 text-blue-500" />
                </div>
                <div className="mt-2 text-2xl font-bold">{totalHabits}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Active portfolio</div>
              </div>

              <div className="p-4 bg-white dark:bg-[#11141d]/90 border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                  <span>Due Today</span>
                  <Activity className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-2 text-2xl font-bold">{scheduledTodayHabits.length}</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">Scheduled on {selectedDate}</div>
              </div>

              <div className="p-4 bg-white dark:bg-[#11141d]/90 border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                  <span>Completed Today</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-2xl font-bold">{completedToday} / {scheduledTodayHabits.length}</div>
                <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">{completionRate}% finished</div>
              </div>

              <div className="p-4 bg-white dark:bg-[#11141d]/90 border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl shadow-xs dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                  <span>Best Streak</span>
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div className="mt-2 text-2xl font-bold">{maxStreak} <span className="text-xs font-normal text-zinc-400">days</span></div>
                <div className="text-[10px] text-orange-400 font-semibold mt-0.5">Compounding momentum</div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    filter === "ALL"
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  All ({habits.length})
                </button>
                <button
                  onClick={() => setFilter("TIME")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    filter === "TIME"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  ⏱️ Time Based
                </button>
                <button
                  onClick={() => setFilter("NUMERICAL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    filter === "NUMERICAL"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  🔢 Numerical
                </button>
                <button
                  onClick={() => setFilter("STATUS")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    filter === "STATUS"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  🏷️ Status / Enum
                </button>
              </div>

              {/* Category Dropdown */}
              {categories.length > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-400">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-[#12151f] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Habit Cards Grid with YouTube-style Shimmer Skeletons */}
            {loading && habits.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonHabitCard key={i} />
                ))}
              </div>
            ) : filteredHabits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredHabits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    selectedDate={selectedDate}
                    onLogUpdated={fetchHabits}
                    onOpenStats={(h) => setStatsHabit(h)}
                    onEditHabit={(h) => {
                      setEditingHabit(h);
                      setIsCreateHabitOpen(true);
                    }}
                    onDeleteHabit={handleDeleteHabit}
                    onOpenTimer={(target) => setTimerTarget(target)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="py-16 text-center bg-white dark:bg-zinc-950/60 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto text-zinc-400">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                    No habits found
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    {filter !== "ALL" || selectedCategory !== "ALL"
                      ? "No habits match your active filters. Try switching filters or create a new habit."
                      : "You haven't added any habits yet. Start tracking your daily goals and consistency!"}
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateHabitOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:scale-105 transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create First Habit
                </button>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 3: COMPREHENSIVE ANALYTICS & TRENDS */
          <AnalyticsDashboard
            onOpenStatsModal={(habit) => setStatsHabit(habit)}
            onNavigateToHabits={() => setActiveTab("HABITS")}
          />
        )}
      </main>

      {/* Create / Edit Habit Modal */}
      <CreateHabitModal
        isOpen={isCreateHabitOpen}
        onClose={() => setIsCreateHabitOpen(false)}
        onSuccess={fetchHabits}
        editHabit={editingHabit}
      />

      {/* Create / Edit Custom Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSuccess={fetchHabits}
        selectedDate={selectedDate}
        editTask={editingTask}
      />

      {/* Detailed Stats & Interactive Calendar Heatmap Modal */}
      <HabitStatsModal
        isOpen={!!statsHabit}
        habit={statsHabit}
        onClose={() => {
          setStatsHabit(null);
          fetchHabits();
        }}
        onHabitUpdated={fetchHabits}
      />

      {/* Live Focus Countdown Timer & Audio Alarm Modal */}
      <TimerModal
        isOpen={!!timerTarget}
        target={timerTarget}
        selectedDate={selectedDate}
        onClose={() => setTimerTarget(null)}
        onSuccess={fetchHabits}
      />
    </div>
  );
}
