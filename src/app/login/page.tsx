"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

      // Full page reload to re-trigger AuthProvider
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-zinc-50 dark:bg-black font-sans">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-950 shadow-xl dark:shadow-black/30 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 transition-all">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white">
            Welcome Back
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-300">
            Sign in to continue to traxx
          </p>
        </div>

        {error && (
          <div className="w-full p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="w-full flex justify-center mt-4">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError("Google Login Failed")}
            useOneTap
            shape="rectangular"
            theme="outline"
          />
        </div>
      </div>
    </div>
  );
}
