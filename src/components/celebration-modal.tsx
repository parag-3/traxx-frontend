"use client";

import React, { useEffect, useState } from "react";
import { ConfettiCanvas } from "./confetti-canvas";
import {
  Trophy,
  Flame,
  CheckCircle2,
  Sparkles,
  Zap,
  Award,
  X,
  ArrowRight,
  Star,
} from "lucide-react";

export type CelebrationType = "DAILY_PERFECT" | "STREAK_MILESTONE";

export interface CelebrationData {
  type: CelebrationType;
  // For DAILY_PERFECT
  completedCount?: number;
  totalCount?: number;
  date?: string;
  // For STREAK_MILESTONE
  habitTitle?: string;
  habitColor?: string;
  habitIcon?: string;
  streakCount?: number;
}

interface CelebrationModalProps {
  data: CelebrationData | null;
  isOpen: boolean;
  onClose: () => void;
  autoDismissMs?: number;
}

// Milestone titles & quotes generator
export function getStreakMilestoneInfo(streak: number) {
  if (streak === 1) {
    return {
      badge: "🌱 Day 1 Kick-Off",
      title: "First Step Conquered!",
      description: "A journey of a thousand miles begins with a single step. You've officially initiated the momentum.",
    };
  }
  if (streak <= 3) {
    return {
      badge: "🔥 3-Day Momentum Spark",
      title: "Building the Habit Flame!",
      description: "Three consecutive days of execution. You are setting the habit foundation in stone.",
    };
  }
  if (streak <= 7) {
    return {
      badge: "⚡ 7-Day Streak Master (1 Week)",
      title: "1 Full Week Completed!",
      description: "7 days of pure discipline! You've successfully conquered an entire week without breaking the chain.",
    };
  }
  if (streak <= 15) {
    return {
      badge: "🚀 15-Day Half-Month Milestone",
      title: "15 Days of Unstoppable Drive!",
      description: "15 consecutive days! This habit is no longer just a goal—it is becoming part of who you are.",
    };
  }
  if (streak <= 30) {
    return {
      badge: "👑 30-Day Legend (1 Full Month)",
      title: "1 Month Consistency Champion!",
      description: "30 days of excellence! Scientific studies prove 30 days automates routine behavior into daily muscle memory.",
    };
  }
  if (streak <= 50) {
    return {
      badge: "💎 50-Day Elite Champion",
      title: "Halfway to Century Mark!",
      description: "50 days unbroken streak! Only top 2% of habit trackers achieve this level of daily focus.",
    };
  }
  if (streak <= 75) {
    return {
      badge: "🏆 75-Day Unstoppable Powerhouse",
      title: "75 Days of Steel Discipline!",
      description: "75 days of relentless compounding momentum. Extraordinary results are born from this consistency.",
    };
  }
  if (streak <= 100) {
    return {
      badge: "⭐ 100-Day Century Club",
      title: "100-Day Centurion Master!",
      description: "100 DAYS! You have entered the Century Club. You are an absolute master of consistency and discipline.",
    };
  }
  if (streak <= 180) {
    return {
      badge: "🌟 Half-Year Discipline Titan (6 Months)",
      title: "6 Months of Daily Mastery!",
      description: "Half a year of unbroken daily commitment. You have achieved true lifestyle transformation.",
    };
  }
  return {
    badge: "🏛️ 365-Day Legendary God Mode (1 Year)",
    title: "365 Days — 1 Full Year!",
    description: "365 consecutive days of greatness! You have accomplished what few will ever achieve. Pure legendary status.",
  };
}

export function CelebrationModal({
  data,
  isOpen,
  onClose,
  autoDismissMs = 4800,
}: CelebrationModalProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isOpen || !data) {
      setProgress(100);
      return;
    }

    const intervalTime = 40;
    const step = (intervalTime / autoDismissMs) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isOpen, data, autoDismissMs, onClose]);

  if (!isOpen || !data) return null;

  const isStreak = data.type === "STREAK_MILESTONE";
  const streakInfo = isStreak ? getStreakMilestoneInfo(data.streakCount || 1) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Confetti Explosion System */}
      <ConfettiCanvas durationMs={autoDismissMs - 500} />

      {/* Backdrop Glass with Smooth Fade-in */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200 cursor-pointer"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#101420]/95 backdrop-blur-2xl border border-zinc-700/80 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-white text-center space-y-6 z-10 animate-in zoom-in-95 fade-in duration-250">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Icon with Luminous Radial Aura */}
        <div className="relative flex items-center justify-center pt-2">
          {/* Ambient Glow Ping Ring */}
          <div
            className={`absolute w-24 h-24 rounded-full blur-2xl opacity-60 animate-pulse ${
              isStreak ? "bg-amber-500" : "bg-emerald-500"
            }`}
          />
          <div
            className={`absolute w-20 h-20 rounded-full border-2 animate-ping opacity-30 ${
              isStreak ? "border-amber-400" : "border-emerald-400"
            }`}
          />

          {/* Center Badge Icon */}
          <div
            className={`relative w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl border ${
              isStreak
                ? "bg-gradient-to-br from-amber-500 to-orange-600 border-amber-300/40 text-white shadow-amber-500/30"
                : "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-300/40 text-white shadow-emerald-500/30"
            }`}
          >
            {isStreak ? (
              <Flame className="w-10 h-10 fill-white drop-shadow-md animate-bounce" />
            ) : (
              <Trophy className="w-10 h-10 text-white drop-shadow-md animate-bounce" />
            )}
          </div>
        </div>

        {/* Celebration Title & Badges */}
        <div className="space-y-2">
          {isStreak && streakInfo ? (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {streakInfo.badge}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {streakInfo.title}
              </h2>
              <div className="text-sm font-bold text-amber-300">
                &ldquo;{data.habitTitle}&rdquo; • {data.streakCount} Day Streak
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-xs mx-auto pt-1">
                {streakInfo.description}
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <Star className="w-3.5 h-3.5 fill-emerald-400" />
                Perfect Day Unlocked
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                🎉 100% Day Completed!
              </h2>
              <div className="text-sm font-bold text-emerald-300">
                Crushed all {data.completedCount ?? data.totalCount} planned tasks & habits for today!
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-xs mx-auto pt-1">
                You finished every single item on your planner today without exception. Compounding momentum is on your side!
              </p>
            </>
          )}
        </div>

        {/* Milestone Pill Highlight */}
        <div className="p-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center justify-around text-center text-xs">
          {isStreak ? (
            <>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Active Streak</div>
                <div className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-400" /> {data.streakCount} Days
                </div>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Consistency</div>
                <div className="text-lg font-black text-emerald-400">100% On Track</div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Tasks & Habits</div>
                <div className="text-lg font-black text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {data.completedCount}/{data.totalCount}
                </div>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Daily Rate</div>
                <div className="text-lg font-black text-blue-400">100% Complete</div>
              </div>
            </>
          )}
        </div>

        {/* Action Button & Auto Dismiss Progress Track */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onClose}
            type="button"
            className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer ${
              isStreak
                ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-amber-500/20"
                : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20"
            }`}
          >
            <span>Awesome! Keep Crushing It</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Auto-Dismiss Linear Progress Line */}
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ease-linear ${
                isStreak ? "bg-amber-400" : "bg-emerald-400"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
