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
    xl: "w-12 h-12",
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dim} ${className}`}>
      {/* Clean Nike Swoosh SVG */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full text-zinc-900 dark:text-white drop-shadow-sm ${
          animated ? "transition-transform group-hover:scale-110 duration-200" : ""
        }`}
      >
        <path d="M21.707 5.293c-2.484 2.115-5.32 4.417-8.243 6.643-2.673 2.036-5.074 3.791-7.14 5.231-1.077.752-1.996 1.347-2.736 1.771-.37.212-.685.378-.938.495-.252.118-.466.195-.632.228-.166.034-.308.026-.418-.023-.11-.049-.2-.14-.258-.266-.058-.126-.078-.282-.058-.456.02-.175.083-.374.186-.595.207-.442.548-.99 1.01-1.631 1.109-1.538 2.684-3.487 4.673-5.748C9.112 8.672 11.53 6.068 14.34 3.23c.31-.312.75-.453 1.178-.378.428.075.787.353.962.744.175.39.127.848-.128 1.196-1.503 2.05-3.084 4.092-4.72 6.096 2.812-2.148 5.674-4.225 8.528-6.194.492-.34.99-.446 1.347-.286.357.16.544.526.478.966-.066.44-.393.925-.878 1.425z" />
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
