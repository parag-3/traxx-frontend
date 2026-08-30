"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: any) => {
    try {
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

      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      {/* Background ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-center gap-6 p-8 bg-white dark:bg-[#11141d]/90 backdrop-blur-xl shadow-2xl dark:shadow-black/50 rounded-3xl border border-zinc-200/80 dark:border-white/[0.08] transition-all">
        {/* Brand Logo */}
        <Logo size="xl" showText={false} />

        <div className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Welcome to <span className="text-zinc-900 dark:text-white">tra</span><span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 bg-clip-text text-transparent">xx</span>
          </h1>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
            Daily focus timer, to-do planner & intelligent habit tracking in one place.
          </p>
        </div>

        {error && (
          <div className="w-full p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-xs rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        <div className="w-full flex justify-center pt-2">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError("Google Login Failed")}
            shape="pill"
            theme="outline"
            size="large"
          />
        </div>
      </div>
    </div>
  );
}
