"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  animated?: boolean;
}

export function LogoIcon({
  size = "md",
  className = "",
  animated = false,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
}) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-14 h-14",
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dim} ${className}`}>
      {/* Ambient glowing backdrop in dark mode */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />

      {/* SVG Emblem */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative w-full h-full drop-shadow-md ${animated ? "transition-transform group-hover:scale-105 duration-300" : ""}`}
      >
        <defs>
          {/* Main Track Gradient */}
          <linearGradient id="traxx-grad-primary" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>

          {/* Secondary Accent Gradient */}
          <linearGradient id="traxx-grad-accent" x1="12" y1="36" x2="40" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Dark Glass Surface Fill */}
          <linearGradient id="traxx-bg-glass" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E2330" />
            <stop offset="100%" stopColor="#0D1017" />
          </linearGradient>

          {/* Inset Border Highlight */}
          <linearGradient id="traxx-border" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Squircle Badge Container */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill="url(#traxx-bg-glass)"
          stroke="url(#traxx-border)"
          strokeWidth="1.5"
        />

        {/* Dynamic Dual Progress Tracks forming 'T' and velocity chevrons */}
        {/* Track 1: Upper Horizontal 'T' Bar & Velocity Arc */}
        <path
          d="M12 16C12 13.7909 13.7909 12 16 12H32C34.2091 12 36 13.7909 36 16C36 18.2091 34.2091 20 32 20H16C13.7909 20 12 18.2091 12 16Z"
          fill="url(#traxx-grad-primary)"
        />

        {/* Track 2: Left Dynamic Vertical Track with forward curve */}
        <path
          d="M20 18V32C20 34.2091 21.7909 36 24 36C26.2091 36 28 34.2091 28 32V18H20Z"
          fill="url(#traxx-grad-primary)"
        />

        {/* Track 3: Forward Momentum Arrow / Checkmark Streak */}
        <path
          d="M13 28L21 35L36 17"
          stroke="url(#traxx-grad-accent)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center Glow Node */}
        <circle cx="21" cy="35" r="2" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export function Logo({
  className = "",
  size = "md",
  showText = true,
  animated = true,
}: LogoProps) {
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className={`group inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <LogoIcon size={size} animated={animated} />
      {showText && (
        <div className="flex items-baseline font-black tracking-tight leading-none">
          <span className={`font-black tracking-tight text-zinc-900 dark:text-white ${textSizes[size]}`}>
            tra
          </span>
          <span
            className={`font-black tracking-tight bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 bg-clip-text text-transparent ${textSizes[size]}`}
          >
            xx
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5 animate-pulse" />
        </div>
      )}
    </div>
  );
}
