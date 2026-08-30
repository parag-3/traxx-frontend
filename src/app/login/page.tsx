"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { LogoIcon } from "@/components/logo";
import { AuthLaunchAnimation } from "@/components/auth-launch-animation";
import { AuthBackgroundAnimation } from "@/components/auth-background-animation";
import { CheckCircle2, Sparkles, Flame, Zap, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");
  const [error, setError] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      if (!res.ok) {
        throw new Error("Failed to authenticate with backend");
      }

      // Trigger cinematic Nike Swoosh launch animation
      setIsLaunching(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans">
      {/* 1. Cinematic Background Logo Entrance & Parallax Orbit Animation */}
      <AuthBackgroundAnimation />

      {/* 2. Starting Launch Animation Overlay upon successful auth */}
      {isLaunching && (
        <AuthLaunchAnimation
          message={
            authMode === "SIGNUP"
              ? "Creating your personal habits & focus workspace..."
              : "Launching your daily planner & habits workspace..."
          }
          onComplete={() => {
            window.location.href = "/";
          }}
          durationMs={2200}
        />
      )}

      {/* 3. Main Glassmorphic Auth Card */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6 p-7 sm:p-9 bg-white/85 dark:bg-[#11141d]/90 backdrop-blur-2xl shadow-[0_20px_70px_-15px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.8)] rounded-3xl border border-zinc-200/80 dark:border-white/[0.08] transition-all">
        {/* Animated Brand Logo Header */}
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 to-indigo-500/40 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition duration-300 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-[#161a26] border border-zinc-200/70 dark:border-white/[0.08] flex items-center justify-center shadow-lg">
            <LogoIcon size="lg" animated={true} />
          </div>
        </div>

        {/* Tab Switcher: Log In vs Sign Up */}
        <div className="w-full flex items-center p-1 bg-zinc-100 dark:bg-white/[0.04] rounded-2xl border border-zinc-200/60 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              setAuthMode("LOGIN");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              authMode === "LOGIN"
                ? "bg-white dark:bg-[#1c2234] text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("SIGNUP");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              authMode === "SIGNUP"
                ? "bg-white dark:bg-[#1c2234] text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            ✨ Sign Up
          </button>
        </div>

        {/* Dynamic Titles */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {authMode === "SIGNUP" ? (
              <>
                Join <span className="text-zinc-900 dark:text-white">tra</span><span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 bg-clip-text text-transparent">xx</span> Today
              </>
            ) : (
              <>
                Welcome to <span className="text-zinc-900 dark:text-white">tra</span><span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 bg-clip-text text-transparent">xx</span>
              </>
            )}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
            {authMode === "SIGNUP"
              ? "Create your workspace in seconds with 1-click Google authentication."
              : "Focus countdown, to-do planner & intelligent habit tracking in one place."}
          </p>
        </div>

        {/* Feature Highlights Pills */}
        <div className="w-full grid grid-cols-1 gap-2 pt-1">
          <div className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Unified Daily Planner & Focus Countdown Timer</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
            <Flame className="w-4 h-4 text-orange-500 shrink-0" />
            <span>Streak Milestones & 100% Day Celebrations</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Interactive Multi-Format Visual Analytics</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="w-full p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-xs rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Google Authentication Button */}
        <div className="w-full flex flex-col items-center gap-3 pt-2">
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError("Google Authentication Failed")}
              shape="pill"
              theme="outline"
              size="large"
              text={authMode === "SIGNUP" ? "signup_with" : "signin_with"}
            />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure SSL Encrypted • Zero Passwords to Remember</span>
          </div>
        </div>
      </div>
    </div>
  );
}
