"use client";

import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base Shimmer Skeleton with YouTube/Instagram wave shimmer effect
 */
export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-zinc-200/80 dark:bg-white/[0.06] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 dark:before:via-white/[0.08] before:to-transparent ${className}`}
      {...props}
    />
  );
}

/**
 * Habit Card Skeleton (Matches HabitCard outline)
 */
export function SkeletonHabitCard() {
  return (
    <div className="bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <Skeleton className="h-4 w-3/5 rounded-md" />
            <Skeleton className="h-3 w-2/5 rounded-md" />
          </div>
        </div>
        <Skeleton className="w-14 h-6 rounded-lg shrink-0" />
      </div>

      {/* Streak Badges & Tags */}
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="w-16 h-5 rounded-md" />
        <Skeleton className="w-20 h-5 rounded-md" />
        <Skeleton className="w-14 h-5 rounded-md" />
      </div>

      {/* Interactive Status Options or Timer Bar */}
      <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.04] flex items-center gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 w-10 rounded-xl" />
      </div>

      {/* Heatmap Bar */}
      <div className="pt-1">
        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>
    </div>
  );
}

/**
 * Daily Planner To-Do Item Skeleton
 */
export function SkeletonPlannerItem() {
  return (
    <div className="bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-3.5">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Priority & Checkbox */}
        <Skeleton className="w-1 h-8 rounded-full" />
        <Skeleton className="w-6 h-6 rounded-full shrink-0" />
        <Skeleton className="w-8 h-8 rounded-xl shrink-0" />

        {/* Title & Metadata */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <Skeleton className="h-4 w-1/2 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="w-20 h-7 rounded-lg" />
        <Skeleton className="w-7 h-7 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Right Sidebar Hub Skeleton
 */
export function SkeletonSidebar() {
  return (
    <div className="space-y-5">
      {/* Daily Progress Card */}
      <div className="bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-5 w-28 rounded-md" />
          </div>
          <Skeleton className="w-16 h-6 rounded-lg" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-36 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
          <Skeleton className="w-13 h-13 rounded-full shrink-0" />
        </div>

        <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-white/[0.04]">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-3 w-10 rounded-md" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="h-3 w-10 rounded-md" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Focus Countdown Widget */}
      <div className="bg-white/80 dark:bg-[#11141d]/80 backdrop-blur-md border border-zinc-200/70 dark:border-white/[0.06] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-36 rounded-md" />
            </div>
          </div>
          <Skeleton className="w-10 h-6 rounded-md" />
        </div>

        <div className="grid grid-cols-5 gap-2 pt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 rounded-xl" />
          ))}
        </div>

        <div className="pt-2">
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * 7-Day Date Navigator Week Strip Skeleton
 */
export function SkeletonWeekStrip() {
  return (
    <div className="grid grid-cols-7 gap-2 sm:gap-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-15 sm:h-17 rounded-xl" />
      ))}
    </div>
  );
}

/**
 * Habit Stats Modal Analytics Skeleton
 */
export function SkeletonStatsModal() {
  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-[#151926] border border-zinc-200/60 dark:border-white/[0.06] space-y-2"
          >
            <Skeleton className="w-6 h-6 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        ))}
      </div>

      {/* Chart Canvas Area */}
      <div className="p-5 rounded-2xl bg-zinc-50/80 dark:bg-[#151926] border border-zinc-200/60 dark:border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-7 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-52 w-full rounded-xl" />
      </div>

      {/* Calendar Grid Placeholder */}
      <div className="p-5 rounded-2xl bg-zinc-50/80 dark:bg-[#151926] border border-zinc-200/60 dark:border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Analytics Dashboard Skeleton
 */
export function SkeletonAnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white/80 dark:bg-[#11141d]/80 border border-zinc-200/70 dark:border-white/[0.06] shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Trend Line Chart Card */}
      <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#11141d]/80 border border-zinc-200/70 dark:border-white/[0.06] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-28 rounded-xl" />
            <Skeleton className="h-8 w-36 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>

      {/* 2-Column Habit Deep Dive Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#11141d]/80 border border-zinc-200/70 dark:border-white/[0.06] shadow-xs space-y-4">
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-[#11141d]/80 border border-zinc-200/70 dark:border-white/[0.06] shadow-xs space-y-4">
          <Skeleton className="h-5 w-36 rounded-md" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
