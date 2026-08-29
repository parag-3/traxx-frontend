"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  Clock,
  Timer,
  Bell,
  Sparkles,
  Volume2,
} from "lucide-react";
import { TimerTarget } from "@/types/habit";
import { API_BASE_URL } from "@/lib/api";
import { playTimerAlarmSound } from "@/lib/audio";

interface TimerModalProps {
  isOpen: boolean;
  target: TimerTarget | null;
  selectedDate: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_DURATIONS = [
  { label: "10m", minutes: 10 },
  { label: "15m", minutes: 15 },
  { label: "25m (Pomo)", minutes: 25 },
  { label: "30m", minutes: 30 },
  { label: "45m", minutes: 45 },
  { label: "60m", minutes: 60 },
];

export function TimerModal({
  isOpen,
  target,
  selectedDate,
  onClose,
  onSuccess,
}: TimerModalProps) {
  const [mode, setMode] = useState<"TIMER" | "MANUAL">("TIMER");

  // Timer State
  const initialMinutes = target?.targetMinutes || 25;
  const [selectedMinutes, setSelectedMinutes] = useState<number>(initialMinutes);
  const [totalSeconds, setTotalSeconds] = useState<number>(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);

  // Manual Log State
  const [manualMinutes, setManualMinutes] = useState<string>(
    target?.targetMinutes ? String(target.targetMinutes) : "25"
  );
  const [markTaskComplete, setMarkTaskComplete] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer when target opens
  useEffect(() => {
    if (target && isOpen) {
      const defaultMins = target.targetMinutes || 25;
      setSelectedMinutes(defaultMins);
      setTotalSeconds(defaultMins * 60);
      setRemainingSeconds(defaultMins * 60);
      setIsRunning(false);
      setIsFinished(false);
      setElapsedMinutes(0);
      setManualMinutes(String(defaultMins));
    }
  }, [target, isOpen]);

  // Handle countdown interval
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);
            setIsFinished(true);
            setElapsedMinutes(selectedMinutes);
            playTimerAlarmSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, remainingSeconds, selectedMinutes]);

  if (!isOpen || !target) return null;

  const handleSelectPreset = (mins: number) => {
    if (isRunning) return;
    setSelectedMinutes(mins);
    setTotalSeconds(mins * 60);
    setRemainingSeconds(mins * 60);
    setIsFinished(false);
  };

  const handleTogglePlay = () => {
    if (isFinished) {
      setRemainingSeconds(totalSeconds);
      setIsFinished(false);
    }
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setIsFinished(false);
    setRemainingSeconds(totalSeconds);
  };

  const handleAdd5Mins = () => {
    setTotalSeconds((prev) => prev + 300);
    setRemainingSeconds((prev) => prev + 300);
    setSelectedMinutes((prev) => prev + 5);
  };

  const handleFinishEarly = () => {
    const elapsedSecs = totalSeconds - remainingSeconds;
    const mins = Math.max(1, Math.round(elapsedSecs / 60));
    setIsRunning(false);
    setIsFinished(true);
    setElapsedMinutes(mins);
    playTimerAlarmSound();
  };

  // Submit confirmed time
  const handleConfirmLog = async (minutesToLog: number, completeTaskOverride?: boolean) => {
    if (submitting || !target) return;
    try {
      setSubmitting(true);

      if (target.type === "HABIT") {
        // Add minutes to habit daily log
        const res = await fetch(`${API_BASE_URL}/api/habits/${target.id}/log`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: selectedDate,
            addMinutes: minutesToLog,
          }),
        });
        if (!res.ok) throw new Error("Failed to log habit time");
      } else {
        // Log time spent on task
        const isComp = completeTaskOverride !== undefined ? completeTaskOverride : markTaskComplete;
        const res = await fetch(`${API_BASE_URL}/api/tasks/${target.id}/log-time`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            minutes: minutesToLog,
            isCompleted: isComp,
          }),
        });
        if (!res.ok) throw new Error("Failed to log task time");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to log timer time:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualMinutes);
    if (!isNaN(val) && val > 0) {
      handleConfirmLog(val);
    }
  };

  // Time format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progressPercent =
    totalSeconds > 0 ? Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-all my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: target.color }}
            >
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {target.type === "HABIT" ? "Habit Timer" : "Task Timer"}
                </span>
                {target.targetMinutes && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Goal: {target.targetMinutes}m
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white truncate max-w-[220px]">
                {target.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-2 bg-zinc-100 dark:bg-zinc-900 m-4 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode("TIMER")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === "TIMER"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Focus Countdown</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("MANUAL")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === "MANUAL"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Manual Time Entry</span>
          </button>
        </div>

        {mode === "TIMER" ? (
          <div className="p-6 pt-2 space-y-6">
            {/* Alarm Ringing Celebration Banner */}
            {isFinished ? (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-center space-y-3 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md animate-bounce">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-900 dark:text-emerald-200">
                    🎉 Focus Session Complete!
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                    You completed <strong>{elapsedMinutes} minutes</strong> on &ldquo;{target.title}&rdquo;.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleConfirmLog(elapsedMinutes)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Yes, Add {elapsedMinutes} mins</span>
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={onClose}
                    className="w-full py-2 bg-transparent hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-xl font-semibold text-xs transition-colors"
                  >
                    Discard Session
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Presets Selection */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Select Focus Duration
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_DURATIONS.map((preset) => (
                      <button
                        key={preset.minutes}
                        type="button"
                        disabled={isRunning}
                        onClick={() => handleSelectPreset(preset.minutes)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                          selectedMinutes === preset.minutes
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                            : "bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Circular / Giant Digital Countdown */}
                <div className="relative flex flex-col items-center justify-center py-6 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/40 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-inner">
                  {/* Progress Indicator Bar */}
                  <div className="w-3/4 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mb-4">
                    <div
                      className="h-full bg-blue-600 transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Digital Clock */}
                  <div className="text-5xl font-black tracking-tight text-zinc-900 dark:text-white tabular-nums">
                    {formatTime(remainingSeconds)}
                  </div>

                  <div className="text-xs text-zinc-400 font-medium mt-1">
                    {isRunning ? "🔥 Deep Focus in Progress..." : "Ready to start session"}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors shadow-xs"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className={`flex-1 py-3.5 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-md transition-all text-sm ${
                      isRunning
                        ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20"
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-5 h-5 fill-white" /> Pause Focus
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-white" /> Start Timer
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleAdd5Mins}
                    className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-colors shadow-xs"
                    title="Add 5 minutes"
                  >
                    +5m
                  </button>
                </div>

                {/* Finish Early Button */}
                {isRunning && totalSeconds - remainingSeconds >= 60 && (
                  <button
                    type="button"
                    onClick={handleFinishEarly}
                    className="w-full text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors py-1 hover:underline"
                  >
                    End early & log {Math.round((totalSeconds - remainingSeconds) / 60)} mins
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          /* Manual Time Entry Form */
          <form onSubmit={handleManualSubmit} className="p-6 pt-2 space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Minutes Worked on this {target.type === "HABIT" ? "Habit" : "Task"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  placeholder="e.g., 30"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-lg font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  required
                />
                <span className="absolute right-4 top-3.5 text-sm font-semibold text-zinc-400">
                  mins
                </span>
              </div>
            </div>

            {/* Quick Increment Steppers */}
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setManualMinutes(String(mins))}
                  className="py-2 text-xs font-bold rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  {mins} mins
                </button>
              ))}
            </div>

            {target.type === "TASK" && (
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markTaskComplete}
                  onChange={(e) => setMarkTaskComplete(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Mark task as completed
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={submitting || !manualMinutes}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-md shadow-blue-500/20 text-sm transition-all"
            >
              {submitting ? "Saving..." : `Log ${manualMinutes || 0} Minutes`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
