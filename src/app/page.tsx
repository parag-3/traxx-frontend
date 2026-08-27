"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Habit } from "@/types/habit";
import { HabitCard } from "@/components/habit-card";
import { CreateHabitModal } from "@/components/create-habit-modal";
import { HabitStatsModal } from "@/components/habit-stats-modal";
import {
  Plus,
  Flame,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Layers,
  Activity,
  Zap,
} from "lucide-react";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "NUMERICAL" | "STATUS">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Selected calendar date (defaults to today)
  const getTodayIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso());

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [statsHabit, setStatsHabit] = useState<Habit | null>(null);

  // Fetch habits
  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/habits?date=${selectedDate}`, {
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

  // Date Navigation
  const handleDateShift = (deltaDays: number) => {
    const parts = selectedDate.split("-").map(Number);
    const d = new Date(Date.UTC(parts[0] || 1970, (parts[1] || 1) - 1, parts[2] || 1));
    d.setUTCDate(d.getUTCDate() + deltaDays);
    const newDateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    setSelectedDate(newDateStr);
  };

  const isToday = selectedDate === getTodayIso();

  // Delete habit
  const handleDeleteHabit = async (habitId: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/habits/${habitId}`, {
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
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-zinc-50 dark:bg-black font-sans text-zinc-400">
        Loading traxx...
      </div>
    );
  }

  // Signed out state
  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-zinc-50 dark:bg-black font-sans p-4">
        <div className="flex flex-col items-center text-center max-w-md w-full p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Welcome to traxx
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Track numerical goals (sums, averages) & custom status habits with real-time streaks.
            </p>
          </div>
          <div className="w-full pt-2">
            <button
              onClick={() => router.push("/login")}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              Sign In to Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Compute metrics
  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.todayLog?.isCompleted).length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

  // Filter habits
  const categories = Array.from(new Set(habits.map((h) => h.category || "General")));
  const filteredHabits = habits.filter((h) => {
    if (filter !== "ALL" && h.type !== filter) return false;
    if (selectedCategory !== "ALL" && (h.category || "General") !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-50/50 dark:bg-black font-sans text-zinc-900 dark:text-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Header: Greeting, Date Switcher & New Habit Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Habit Tracker Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Build lasting momentum with daily check-ins and streaks
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Navigator */}
            <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => handleDateShift(-1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 flex items-center gap-1.5 text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>{selectedDate}</span>
                {isToday && (
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded-full">
                    Today
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDateShift(1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Create Habit Button */}
            <button
              onClick={() => {
                setEditingHabit(null);
                setIsCreateOpen(true);
              }}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> New Habit
            </button>
          </div>
        </div>

        {/* Overview Stats Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
              <span>Active Habits</span>
              <Layers className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold">{totalHabits}</div>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
              <span>Completed Today</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold">
              {completedToday} <span className="text-xs font-normal text-zinc-400">/ {totalHabits}</span>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
              <span>Goal Success Rate</span>
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {completionRate}%
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
              <span>Top Active Streak</span>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {maxStreak} <span className="text-xs font-normal text-zinc-400">days</span>
            </div>
          </div>
        </div>

        {/* Filter Controls & Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === "ALL"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              All Habits ({habits.length})
            </button>
            <button
              onClick={() => setFilter("NUMERICAL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === "NUMERICAL"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              🔢 Numerical
            </button>
            <button
              onClick={() => setFilter("STATUS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === "STATUS"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              🏷️ Custom Status / Enum
            </button>
          </div>

          {/* Category Dropdown */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none"
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

        {/* Habit Cards Grid */}
        {loading && habits.length === 0 ? (
          <div className="py-20 text-center text-sm text-zinc-400">
            Loading your habits...
          </div>
        ) : filteredHabits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                selectedDate={selectedDate}
                onLogUpdated={fetchHabits}
                onOpenStats={(h) => setStatsHabit(h)}
                onEditHabit={(h) => {
                  setEditingHabit(h);
                  setIsCreateOpen(true);
                }}
                onDeleteHabit={handleDeleteHabit}
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
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Create a numerical or custom status habit to start tracking your daily progress and building streaks!
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setEditingHabit(null);
                  setIsCreateOpen(true);
                }}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Your First Habit
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Create / Edit Habit Modal */}
      <CreateHabitModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchHabits}
        editHabit={editingHabit}
      />

      {/* Detailed Stats & Calendar Heatmap Modal */}
      <HabitStatsModal
        isOpen={!!statsHabit}
        habit={statsHabit}
        onClose={() => setStatsHabit(null)}
      />
    </div>
  );
}
