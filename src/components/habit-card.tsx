"use client";

import { useState } from "react";
import { Habit } from "@/types/habit";
import { API_BASE_URL } from "@/lib/api";
import {
  Flame,
  Trophy,
  MoreVertical,
  BarChart2,
  Edit2,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  BookOpen,
  Dumbbell,
  Droplets,
  Sparkles,
  Heart,
  Target,
  Brain,
  Coffee,
  Activity,
  Calendar,
  Clock,
  RotateCcw,
  X,
  Timer,
  Play,
} from "lucide-react";
import { TimerTarget } from "@/types/habit";

interface HabitCardProps {
  habit: Habit;
  selectedDate: string;
  onLogUpdated: () => void;
  onOpenStats: (habit: Habit) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
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

export function HabitCard({
  habit,
  selectedDate,
  onLogUpdated,
  onOpenStats,
  onEditHabit,
  onDeleteHabit,
  onOpenTimer,
}: HabitCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logging, setLogging] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [showInput, setShowInput] = useState(false);

  const IconComp = ICON_MAP[habit.icon] || Activity;
  const todayLog = habit.todayLog;

  // Compute numerical / time progress
  const currentVal = todayLog?.numericValue ?? 0;
  const hasNumericalLog = todayLog?.numericValue !== null && todayLog?.numericValue !== undefined;
  const target = habit.targetValue ?? 1;
  const progressPercent = Math.min(100, Math.round((currentVal / target) * 100));

  // Current status option
  const currentStatusVal = todayLog?.statusValue;
  const hasStatusLog = Boolean(currentStatusVal);
  const currentOption = habit.statusOptions.find((o) => o.value === currentStatusVal) || habit.statusOptions[0];

  // Helper to send log to API
  const sendLog = async (payload: { numericValue?: number | null; statusValue?: string | null; clear?: boolean }) => {
    try {
      setLogging(true);
      const res = await fetch(`${API_BASE_URL}/api/habits/${habit.id}/log`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          ...payload,
        }),
      });
      if (res.ok) {
        onLogUpdated();
      }
    } catch (err) {
      console.error("Log update failed", err);
    } finally {
      setLogging(false);
    }
  };

  // Clear / Reset today's log
  const handleClearLog = () => {
    sendLog({ clear: true, numericValue: null, statusValue: null });
  };

  // Numerical Quick Increment
  const handleNumericStep = (delta: number) => {
    const nextVal = Math.max(0, currentVal + delta);
    if (nextVal === 0 && delta < 0) {
      handleClearLog();
    } else {
      sendLog({ numericValue: nextVal });
    }
  };

  const handleCustomNumericSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customValue === "") return;
    const num = parseFloat(customValue);
    if (!isNaN(num)) {
      if (num <= 0) {
        handleClearLog();
      } else {
        sendLog({ numericValue: num });
      }
      setShowInput(false);
      setCustomValue("");
    }
  };

  // Status Cycle
  const handleCycleStatus = () => {
    if (habit.statusOptions.length === 0) return;
    if (!hasStatusLog) {
      // First state
      sendLog({ statusValue: habit.statusOptions[0]?.value });
      return;
    }
    const currentIndex = habit.statusOptions.findIndex((o) => o.value === currentStatusVal);
    const nextIndex = (currentIndex + 1) % habit.statusOptions.length;
    sendLog({ statusValue: habit.statusOptions[nextIndex]?.value });
  };

  // Direct select status
  const handleSelectStatus = (statusVal: string) => {
    if (currentStatusVal === statusVal) {
      handleClearLog();
    } else {
      sendLog({ statusValue: statusVal });
    }
  };

  const isRestDay = !habit.isScheduledToday;
  const isLoggedToday = Boolean(todayLog);

  let freqLabel = "Daily";
  if (habit.frequencyType === "WEEKDAYS") freqLabel = "Weekdays";
  else if (habit.frequencyType === "WEEKENDS") freqLabel = "Weekends";
  else if (habit.frequencyType === "CUSTOM_DAYS") {
    freqLabel = habit.frequencyDays ? habit.frequencyDays.replace(/,/g, " ") : "Custom";
  }

  return (
    <div
      className={`group relative rounded-3xl p-5 border transition-all duration-200 bg-white dark:bg-zinc-950 flex flex-col justify-between ${
        todayLog?.isCompleted
          ? "border-emerald-500/40 shadow-sm shadow-emerald-500/5 ring-1 ring-emerald-500/20"
          : isRestDay
          ? "border-zinc-200/50 dark:border-zinc-800/40 opacity-75"
          : "border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs"
      }`}
    >
      <div>
        {/* Top bar: Category, Frequency, Rest day flag & 3-dot Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 transition-transform group-hover:scale-105"
              style={{ backgroundColor: habit.color }}
            >
              <IconComp className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {habit.category || "General"}
                </span>
                {/* Frequency Badge */}
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded-md border border-zinc-200/60 dark:border-zinc-800">
                  <Calendar className="w-2.5 h-2.5 text-blue-500" />
                  {freqLabel}
                </span>
                {/* Start Date Tag */}
                {habit.startDate && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 hidden sm:inline">
                    Since {habit.startDate}
                  </span>
                )}
                {/* Rest Day Indicator */}
                {isRestDay && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
                    🌿 Rest Day
                  </span>
                )}
              </div>

              <h3 className="font-bold text-base text-zinc-900 dark:text-white mt-1 leading-snug">
                {habit.title}
              </h3>
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl py-1 z-20 animate-in fade-in slide-in-from-top-1 text-xs">
                {onOpenTimer && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenTimer({
                        type: "HABIT",
                        id: habit.id,
                        title: habit.title,
                        color: habit.color,
                        targetMinutes: habit.type === "TIME" ? (habit.targetValue || 25) : 25,
                        currentMinutes: currentVal,
                      });
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Timer className="w-3.5 h-3.5 text-emerald-500" /> Focus Timer
                  </button>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenStats(habit);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-blue-500" /> Stats & History
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEditHabit(habit);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-500" /> Edit Habit
                </button>
                {isLoggedToday && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleClearLog();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-800"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear Today&apos;s Log
                  </button>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (confirm("Are you sure you want to delete this habit?")) {
                      onDeleteHabit(habit.id);
                    }
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-800"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {habit.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2">
            {habit.description}
          </p>
        )}

        {/* Streaks Badges & Reminder */}
        <div className="flex items-center gap-2 mt-3.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
            <span>
              {habit.currentStreak} <span className="font-normal text-[10px]">streak</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {habit.bestStreak} <span className="font-normal text-[10px]">best</span>
            </span>
          </div>
          {habit.reminderEnabled && habit.reminderTime && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-[11px] font-medium">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{habit.reminderTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Action Section (Time vs Numerical vs Custom Enum) */}
      <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
        {habit.type === "TIME" ? (
          /* TIME HABIT SECTION */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                Focus Time: <strong className="text-zinc-900 dark:text-white font-bold">{currentVal}</strong> / {habit.targetValue || 25} mins
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {progressPercent}%
                </span>
                {isLoggedToday && (
                  <button
                    onClick={handleClearLog}
                    className="text-[10px] text-zinc-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-0.5 hover:underline transition-colors"
                    title="Reset back to 0 / clear entry"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: habit.color,
                }}
              />
            </div>

            {/* Interactive Timer Launch & Fast Increment Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1">
              {onOpenTimer && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenTimer({
                      type: "HABIT",
                      id: habit.id,
                      title: habit.title,
                      color: habit.color,
                      targetMinutes: habit.targetValue || 25,
                      currentMinutes: currentVal,
                    })
                  }
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Start Focus Timer</span>
                </button>
              )}

              {/* Fast Steppers */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleNumericStep(15)}
                  disabled={logging}
                  className="px-2.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
                  title="Add 15 minutes manually"
                >
                  +15m
                </button>
                <button
                  onClick={() => handleNumericStep(30)}
                  disabled={logging}
                  className="px-2.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
                  title="Add 30 minutes manually"
                >
                  +30m
                </button>
              </div>
            </div>
          </div>
        ) : habit.type === "NUMERICAL" ? (
          <div className="space-y-2.5">
            {/* Progress Label & Clear Action */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                Progress: <strong className="text-zinc-900 dark:text-white font-bold">{currentVal}</strong> / {habit.targetValue} {habit.unit}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {progressPercent}%
                </span>
                {isLoggedToday && (
                  <button
                    onClick={handleClearLog}
                    className="text-[10px] text-zinc-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-0.5 hover:underline transition-colors"
                    title="Reset back to 0 / clear entry"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: habit.color,
                }}
              />
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center justify-between gap-1.5 pt-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleNumericStep(-1)}
                  disabled={logging || currentVal <= 0}
                  className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-30"
                  title="Subtract 1"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleNumericStep(1)}
                  disabled={logging}
                  className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-30"
                  title="Add 1"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleNumericStep(5)}
                  disabled={logging}
                  className="px-2 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
                  title="Add 5"
                >
                  +5
                </button>
              </div>

              {showInput ? (
                <form onSubmit={handleCustomNumericSubmit} className="flex items-center gap-1">
                  <input
                    type="number"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="Val"
                    className="w-16 px-1.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md font-medium"
                  >
                    Set
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInput(true)}
                    className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 underline decoration-dotted"
                  >
                    Set custom
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Custom Status / Enum Habit */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>Today&apos;s Status:</span>
              {hasStatusLog ? (
                <button
                  onClick={handleClearLog}
                  className="text-[11px] text-zinc-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-0.5 hover:underline"
                  title="Clear today's status selection"
                >
                  <X className="w-3 h-3" /> Clear selection
                </button>
              ) : (
                <span className="text-[11px] text-zinc-400">Click to select</span>
              )}
            </div>

            {/* Dynamic Status Button with Custom State Color */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCycleStatus}
                disabled={logging}
                className="flex-1 py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-between shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
                style={{
                  backgroundColor: hasStatusLog && currentOption ? `${currentOption.color}20` : "#94A3B815",
                  borderColor: hasStatusLog && currentOption ? currentOption.color : "#94A3B840",
                  borderWidth: "1.5px",
                  color: hasStatusLog && currentOption ? currentOption.color : "#94A3B8",
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: hasStatusLog && currentOption ? currentOption.color : "#94A3B8" }}
                  />
                  <span>{hasStatusLog && currentOption ? currentOption.label : "Not Logged (Click to Set)"}</span>
                </span>
                <span className="text-[10px] opacity-70 font-normal">Cycle ➔</span>
              </button>
            </div>

            {/* Status pills selector for instant choice (clicking active pill deselects/clears it) */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
              {habit.statusOptions.map((opt) => {
                const isSelected = currentStatusVal === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectStatus(opt.value)}
                    className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all border ${
                      isSelected
                        ? "shadow-sm font-bold scale-105"
                        : "opacity-60 hover:opacity-100 bg-transparent border-transparent"
                    }`}
                    style={{
                      backgroundColor: isSelected ? opt.color : undefined,
                      color: isSelected ? "#FFFFFF" : opt.color,
                      borderColor: isSelected ? opt.color : undefined,
                    }}
                    title={isSelected ? "Click to clear/unselect" : `Select ${opt.label}`}
                  >
                    {isSelected ? `✓ ${opt.label}` : opt.label}
                  </button>
                );
              })}

              {hasStatusLog && (
                <button
                  onClick={handleClearLog}
                  className="px-2 py-1 rounded-md text-[10px] font-medium text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Clear status log"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* 7-Day Mini History Indicators */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <span className="text-[10px] font-medium text-zinc-400">Past 7 days:</span>
          <div className="flex items-center gap-1.5">
            {habit.history7Days.map((day, idx) => {
              const dateObj = new Date(day.date);
              const dayLetter = ["S", "M", "T", "W", "T", "F", "S"][dateObj.getUTCDay()] || "";
              
              let dotBg = "#E4E4E7"; // zinc-200 light
              if (habit.type === "STATUS" && day.color) {
                dotBg = day.color;
              } else if (day.isCompleted) {
                dotBg = habit.color;
              }

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-0.5"
                  title={`${day.date}: ${day.isCompleted ? "Completed" : day.isScheduled === false ? "Rest Day" : "Not completed"}`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full transition-transform hover:scale-125 flex items-center justify-center"
                    style={{
                      backgroundColor: day.isCompleted || (habit.type === "STATUS" && day.color) ? dotBg : undefined,
                    }}
                  >
                    {!day.isCompleted && !day.color && (
                      <span
                        className={`block w-full h-full rounded-full ${
                          day.isScheduled === false
                            ? "bg-zinc-100 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700"
                            : "bg-zinc-200 dark:bg-zinc-800"
                        }`}
                      />
                    )}
                  </span>
                  <span className="text-[8px] text-zinc-400">{dayLetter}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
