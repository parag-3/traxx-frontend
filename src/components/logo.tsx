"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showText?: boolean;
  animated?: boolean;
  isDrawing?: boolean;
}

export const NIKE_SWOOSH_PATH =
  "M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.12 0-1.933-.392-2.437-1.177-.317-.504-.41-1.143-.28-1.918.13-.775.476-1.6 1.036-2.478.467-.71 1.232-1.643 2.297-2.8a6.122 6.122 0 00-.784 1.848c-.28 1.195-.028 2.072.756 2.632.373.261.886.392 1.54.392.522 0 1.11-.084 1.764-.252L24 7.8z";

export function LogoIcon({
  size = "md",
  className = "",
  animated = false,
  isDrawing = false,
}: {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  animated?: boolean;
  isDrawing?: boolean;
}) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
    "2xl": "w-20 h-20",
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dim} ${className}`}>
      {/* Authentic Nike Swoosh SVG Vector */}
      <svg
        viewBox="-1 -1 26 26"
        overflow="visible"
        fill={isDrawing ? "none" : "currentColor"}
        stroke={isDrawing ? "currentColor" : "none"}
        strokeWidth={isDrawing ? 1.5 : 0}
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full overflow-visible text-zinc-900 dark:text-white drop-shadow-sm ${
          animated ? "transition-transform group-hover:scale-110 duration-200" : ""
        } ${isDrawing ? "animate-swoosh-draw" : ""}`}
      >
        <path d={NIKE_SWOOSH_PATH} />
      </svg>
    </div>
  );
}

export function Logo({
  className = "",
  size = "md",
  showText = true,
  animated = true,
  isDrawing = false,
}: LogoProps) {
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
    "2xl": "text-4xl",
  };

  return (
    <div className={`group inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <LogoIcon size={size} animated={animated} isDrawing={isDrawing} />
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
