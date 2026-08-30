"use client";

import React, { useEffect, useState } from "react";
import { NIKE_SWOOSH_PATH } from "./logo";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface AuthLaunchAnimationProps {
  message?: string;
  onComplete?: () => void;
  durationMs?: number;
}

export function AuthLaunchAnimation({
  message = "Signing in & launching your workspace...",
  onComplete,
  durationMs = 2400,
}: AuthLaunchAnimationProps) {
  const [stage, setStage] = useState<"SWOOSH_DRAW" | "GLOW_EXPAND" | "READY">("SWOOSH_DRAW");

  useEffect(() => {
    // Stage 1: Swoosh sweep
    const t1 = setTimeout(() => {
      setStage("GLOW_EXPAND");
    }, 800);

    // Stage 2: Ready
    const t2 = setTimeout(() => {
      setStage("READY");
    }, 1800);

    // Stage 3: Finish callback
    const t3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, durationMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete, durationMs]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090b10]/95 backdrop-blur-2xl text-white select-none animate-in fade-in duration-300">
      {/* Dynamic Background Ambient Aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className={`w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-indigo-500/20 blur-3xl transition-all duration-1000 ${
            stage === "GLOW_EXPAND" ? "scale-125 opacity-100" : "scale-90 opacity-60"
          }`}
        />
      </div>

      <div className="relative flex flex-col items-center gap-8 max-w-sm text-center px-6">
        {/* Animated Nike Swoosh Container */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Outer Shockwave Ring */}
          <div
            className={`absolute -inset-6 rounded-full border border-emerald-500/30 transition-all duration-700 ${
              stage !== "SWOOSH_DRAW" ? "scale-110 opacity-40 animate-ping" : "scale-75 opacity-0"
            }`}
          />

          {/* Glowing Swoosh Logo */}
          <div
            className={`w-28 h-28 flex items-center justify-center transition-all duration-700 transform ${
              stage === "GLOW_EXPAND"
                ? "scale-110 drop-shadow-[0_0_35px_rgba(16,185,129,0.8)]"
                : "scale-100 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-white"
            >
              <defs>
                <linearGradient id="launch-swoosh-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
              <path
                d={NIKE_SWOOSH_PATH}
                fill="url(#launch-swoosh-grad)"
                className="transition-all duration-500"
              />
            </svg>
          </div>
        </div>

        {/* Brand Typography with Staggered Slide */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-center font-black tracking-tight text-3xl">
            <span className="text-white">tra</span>
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              xx
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1 animate-pulse" />
          </div>
          <p className="text-xs text-zinc-400 font-medium tracking-wide">
            {stage === "READY" ? "Welcome back! Entering workspace..." : message}
          </p>
        </div>

        {/* Smooth Linear Progress Track */}
        <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 transition-all ease-out"
            style={{
              width: stage === "SWOOSH_DRAW" ? "35%" : stage === "GLOW_EXPAND" ? "80%" : "100%",
              transitionDuration: stage === "SWOOSH_DRAW" ? "800ms" : "1000ms",
            }}
          />
        </div>
      </div>
    </div>
  );
}
