"use client";

import React, { useEffect, useState, useRef } from "react";
import { Flame, Clock, CheckCircle2, TrendingUp, Sparkles, Zap, Target } from "lucide-react";

export function AuthBackgroundAnimation() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 30; // +/- 15px
      const y = (e.clientY / innerHeight - 0.5) * 30; // +/- 15px
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 flex items-center justify-center">
      {/* 1. Large Ambient Multi-Color Glow Orbs */}
      <div
        className="absolute w-[600px] sm:w-[850px] h-[600px] sm:h-[850px] rounded-full blur-[110px] opacity-40 dark:opacity-30 transition-transform duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, rgba(6,182,212,0.2) 40%, rgba(139,92,246,0.15) 70%, transparent 100%)",
          transform: `translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 0)`,
        }}
      />

      {/* 2. Rotating Orbital Energy Rings */}
      <div
        className="absolute w-[460px] sm:w-[680px] h-[460px] sm:h-[680px] rounded-full border border-dashed border-emerald-500/10 dark:border-emerald-500/20 animate-[orbital-spin_40s_linear_infinite]"
      />
      <div
        className="absolute w-[580px] sm:w-[820px] h-[580px] sm:h-[820px] rounded-full border border-dashed border-cyan-500/10 dark:border-cyan-500/20 animate-[orbital-spin-reverse_55s_linear_infinite]"
      />

      {/* 3. Hero Brand Nike Logo Swoosh with Entrance & Floating 3D Parallax */}
      <div
        className={`relative transition-all duration-1000 ease-out ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
        style={{
          transform: `translate3d(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px, 0) rotate3d(1, 1, 0, ${mousePos.x * 0.15}deg)`,
        }}
      >
        <div className="animate-[bg-swoosh-float_8s_easeInOut_infinite]">
          <svg
            viewBox="0 0 24 24"
            className="w-[320px] sm:w-[540px] md:w-[680px] h-auto text-zinc-900/5 dark:text-white/[0.04] transition-all duration-300"
            fill="currentColor"
            style={{
              filter: "drop-shadow(0 0 45px rgba(16, 185, 129, 0.18))",
            }}
          >
            {/* Base Fill */}
            <path d="M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.12 0-1.933-.392-2.437-1.177-.317-.504-.41-1.143-.28-1.918.13-.775.476-1.6 1.036-2.478.467-.71 1.232-1.643 2.297-2.8a6.122 6.122 0 00-.784 1.848c-.28 1.195-.028 2.072.756 2.632.373.261.886.392 1.54.392.522 0 1.11-.084 1.764-.252L24 7.8z" />

            {/* Glowing Neon Contour Laser Outline */}
            <path
              d="M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.12 0-1.933-.392-2.437-1.177-.317-.504-.41-1.143-.28-1.918.13-.775.476-1.6 1.036-2.478.467-.71 1.232-1.643 2.297-2.8a6.122 6.122 0 00-.784 1.848c-.28 1.195-.028 2.072.756 2.632.373.261.886.392 1.54.392.522 0 1.11-.084 1.764-.252L24 7.8z"
              fill="none"
              stroke="url(#bg-swoosh-gradient)"
              strokeWidth="0.35"
              className="animate-[swoosh-glow_4s_easeInOut_infinite]"
              style={{
                strokeDasharray: 75,
                animation: "swoosh-draw 3s cubic-bezier(0.16, 1, 0.3, 1) forwards, swoosh-glow 4s ease-in-out infinite 3s",
              }}
            />

            <defs>
              <linearGradient id="bg-swoosh-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 4. Floating Glass Productivity Feature Pills */}
      {/* Top Left: Streak Master */}
      <div
        className="hidden md:flex absolute top-[18%] left-[10%] lg:left-[15%] items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-[#121622]/80 backdrop-blur-xl border border-zinc-200/80 dark:border-white/[0.08] shadow-xl text-xs font-bold text-zinc-800 dark:text-white animate-[float-slow_6s_easeInOut_infinite] transition-transform duration-500"
        style={{
          transform: `translate3d(${-mousePos.x * 0.9}px, ${-mousePos.y * 0.9}px, 0)`,
        }}
      >
        <div className="w-7 h-7 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center shadow-xs">
          <Flame className="w-4 h-4 fill-orange-500" />
        </div>
        <div>
          <div className="text-[10px] text-zinc-400 font-medium leading-none">Habit Momentum</div>
          <div className="text-xs font-black text-orange-400 mt-0.5">14-Day Streak Unbroken</div>
        </div>
      </div>

      {/* Top Right: Deep Focus Timer */}
      <div
        className="hidden md:flex absolute top-[22%] right-[10%] lg:right-[15%] items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-[#121622]/80 backdrop-blur-xl border border-zinc-200/80 dark:border-white/[0.08] shadow-xl text-xs font-bold text-zinc-800 dark:text-white animate-[float-slow-reverse_7s_easeInOut_infinite] transition-transform duration-500"
        style={{
          transform: `translate3d(${mousePos.x * 0.7}px, ${-mousePos.y * 0.7}px, 0)`,
        }}
      >
        <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shadow-xs">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] text-zinc-400 font-medium leading-none">Deep Work</div>
          <div className="text-xs font-black text-emerald-400 mt-0.5">45m Focus Session</div>
        </div>
      </div>

      {/* Bottom Left: Perfect Day Completion */}
      <div
        className="hidden lg:flex absolute bottom-[20%] left-[12%] items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-[#121622]/80 backdrop-blur-xl border border-zinc-200/80 dark:border-white/[0.08] shadow-xl text-xs font-bold text-zinc-800 dark:text-white animate-[float-slow_8s_easeInOut_infinite] transition-transform duration-500"
        style={{
          transform: `translate3d(${-mousePos.x * 0.6}px, ${mousePos.y * 0.6}px, 0)`,
        }}
      >
        <div className="w-7 h-7 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] text-zinc-400 font-medium leading-none">Planner Goals</div>
          <div className="text-xs font-black text-cyan-400 mt-0.5">100% Day Completed</div>
        </div>
      </div>

      {/* Bottom Right: Analytics & Velocity */}
      <div
        className="hidden lg:flex absolute bottom-[18%] right-[12%] items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-[#121622]/80 backdrop-blur-xl border border-zinc-200/80 dark:border-white/[0.08] shadow-xl text-xs font-bold text-zinc-800 dark:text-white animate-[float-slow-reverse_9s_easeInOut_infinite] transition-transform duration-500"
        style={{
          transform: `translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 0)`,
        }}
      >
        <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shadow-xs">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] text-zinc-400 font-medium leading-none">Smart Analytics</div>
          <div className="text-xs font-black text-purple-400 mt-0.5">Multi-Graph Velocity</div>
        </div>
      </div>

      {/* 5. Subtle Grid Background Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
