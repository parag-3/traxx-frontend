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
      } else if (target.type === "TASK") {
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
    totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;
  const strokeDashoffset = 100 - progressPercent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f121a] border border-zinc-200/80 dark:border-white/[0.08] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transition-all my-auto">
        {/* Top Header with spacious padding */}
        <div className="flex items-center justify-between px-6 sm:px-7 py-5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/40 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
              style={{ backgroundColor: target.color || "#3B82F6" }}
            >
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300">
                  {target.type === "HABIT" ? "Habit Timer" : target.type === "TASK" ? "Task Timer" : "Focus Session"}
                </span>
                {target.targetMinutes && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Goal: {target.targetMinutes}m
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white truncate max-w-[260px] mt-0.5">
                {target.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Close timer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs with clean breathing room */}
        <div className="px-6 sm:px-7 pt-5">
          <div className="grid grid-cols-2 p-1.5 bg-zinc-100 dark:bg-[#151926] rounded-2xl border border-zinc-200/50 dark:border-white/[0.04]">
            <button
              type="button"
              onClick={() => setMode("TIMER")}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === "TIMER"
                  ? "bg-white dark:bg-[#1c2234] text-blue-600 dark:text-cyan-400 shadow-xs border border-transparent dark:border-white/[0.06]"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Interactive Countdown</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("MANUAL")}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === "MANUAL"
                  ? "bg-white dark:bg-[#1c2234] text-blue-600 dark:text-cyan-400 shadow-xs border border-transparent dark:border-white/[0.06]"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Manual Time Entry</span>
            </button>
          </div>
        </div>

        {mode === "TIMER" ? (
          <div className="p-6 sm:p-7 space-y-6">
            {/* Alarm Ringing Celebration Banner */}
            {isFinished ? (
              <div className="p-6 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-bounce">
                  <Bell className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-emerald-950 dark:text-emerald-200">
                    🎉 Focus Session Complete!
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    You completed <strong>{elapsedMinutes} minutes</strong> on &ldquo;{target.title}&rdquo;.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleConfirmLog(elapsedMinutes)}
                    className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Yes, Log {elapsedMinutes} mins</span>
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-3 bg-transparent hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-2xl font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Duration Presets Selection with comfortable gap */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    <span>Duration Presets</span>
                    <span className="text-zinc-500 lowercase">({selectedMinutes} min selected)</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_DURATIONS.map((preset) => (
                      <button
                        key={preset.minutes}
                        type="button"
                        disabled={isRunning}
                        onClick={() => handleSelectPreset(preset.minutes)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          selectedMinutes === preset.minutes
                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.02]"
                            : "bg-zinc-50/80 dark:bg-[#151926] border-zinc-200/60 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#1c2234] disabled:opacity-40"
                        }`}
                      >
                        {preset.minutes}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Circular Countdown Dial with Generous Negative Space */}
                <div className="flex flex-col items-center justify-center py-5 sm:py-6 relative">
                  <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
                    {/* SVG Circular Progress Ring */}
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        strokeWidth="5"
                        className="text-zinc-100 dark:text-white/[0.05]"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      {/* Animated Progress Stroke */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        strokeWidth="5"
                        strokeDasharray="264"
                        strokeDashoffset={`${(strokeDashoffset / 100) * 264}`}
                        strokeLinecap="round"
                        stroke="url(#timerGradient)"
                        fill="transparent"
                        className="transition-all duration-1000 ease-linear"
                      />
                      <defs>
                        <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Digital Countdown in center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white tabular-nums">
                        {formatTime(remainingSeconds)}
                      </span>
                      <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mt-1.5 flex items-center gap-1">
                        {isRunning ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Focusing...
                          </>
                        ) : (
                          "Ready to start"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Controls with generous empty surrounding space */}
                <div className="flex items-center justify-center gap-4 sm:gap-5 pt-1">
                  {/* Reset Button */}
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-[#151926] hover:bg-zinc-200 dark:hover:bg-[#1c2234] border border-zinc-200/60 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-all cursor-pointer hover:scale-105 shadow-xs"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Big Play / Pause Main Button */}
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className={`flex-1 max-w-[220px] h-13 rounded-2xl text-white font-bold flex items-center justify-center gap-2.5 shadow-lg transition-all text-sm cursor-pointer hover:scale-[1.02] ${
                      isRunning
                        ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/25"
                        : "bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 shadow-blue-600/25"
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

                  {/* Add 5 Mins Button */}
                  <button
                    type="button"
                    onClick={handleAdd5Mins}
                    className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-[#151926] hover:bg-zinc-200 dark:hover:bg-[#1c2234] border border-zinc-200/60 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-200 font-bold text-xs flex items-center justify-center transition-all cursor-pointer hover:scale-105 shadow-xs"
                    title="Add 5 minutes"
                  >
                    +5m
                  </button>
                </div>

                {/* Finish Early Link */}
                {isRunning && totalSeconds - remainingSeconds >= 60 && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleFinishEarly}
                      className="text-xs font-semibold text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors py-1 hover:underline cursor-pointer"
                    >
                      End early & log {Math.round((totalSeconds - remainingSeconds) / 60)} mins
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Manual Time Entry Form with spacious fields */
          <form onSubmit={handleManualSubmit} className="p-6 sm:p-7 space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Minutes to Log on this {target.type === "HABIT" ? "Habit" : "Task"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(e.target.value)}
                  placeholder="e.g., 30"
                  className="w-full px-4 py-3 bg-zinc-50/80 dark:bg-[#151926] border border-zinc-200/80 dark:border-white/[0.08] rounded-2xl text-lg font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  required
                />
                <span className="absolute right-4 top-3.5 text-sm font-semibold text-zinc-400">
                  mins
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setManualMinutes(String(mins))}
                  className="py-2 text-xs font-bold rounded-xl bg-zinc-100 dark:bg-[#151926] hover:bg-zinc-200 dark:hover:bg-[#1c2234] border border-zinc-200/50 dark:border-white/[0.04] text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  {mins}m
                </button>
              ))}
            </div>

            {target.type === "TASK" && (
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-[#151926] border border-zinc-200/60 dark:border-white/[0.06] cursor-pointer">
                <input
                  type="checkbox"
                  checked={markTaskComplete}
                  onChange={(e) => setMarkTaskComplete(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Mark task as completed
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={submitting || !manualMinutes}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 text-sm transition-all cursor-pointer hover:scale-[1.01]"
            >
              {submitting ? "Saving..." : `Log ${manualMinutes || 0} Minutes`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
