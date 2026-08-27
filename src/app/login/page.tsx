"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/google", {
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
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-zinc-50 dark:bg-black font-sans p-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-950 shadow-xl dark:shadow-black/30 rounded-3xl border border-zinc-200 dark:border-zinc-800/60 transition-all">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Zap className="w-6 h-6" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Sign In to traxx
          </h1>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            Track daily numerical targets and custom enum habits
          </p>
        </div>

        {error && (
          <div className="w-full p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="w-full flex justify-center pt-2">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError("Google Login Failed")}
            shape="rectangular"
            theme="outline"
            size="large"
          />
        </div>
      </div>
    </div>
  );
}
