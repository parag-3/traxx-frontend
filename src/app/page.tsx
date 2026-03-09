"use client";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [appName, setAppName] = useState<string | null>(null);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:3001/api/app-name", { credentials: "omit" })
      .then((res) => res.json())
      .then((data) => setAppName(data["app-name"]))
      .catch(() => console.error("Failed to fetch app name"));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-zinc-50 dark:bg-black font-sans text-zinc-500 dark:text-zinc-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-zinc-950 shadow-xl dark:shadow-black/30 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 transition-all w-full max-w-lg">
        {user ? (
          <div className="flex flex-col items-center gap-4 w-full">
            {user.picture && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt="Profile" className="w-20 h-20 rounded-full border-4 border-zinc-100 dark:border-zinc-800/60 shadow-sm" />
            )}
            <div className="text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white">
                Welcome, {user.name}
              </h1>
              <p className="mt-1 text-zinc-500 dark:text-zinc-300">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center text-center gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white">
              Connect to traxx
            </h1>
            <p className="text-zinc-500 dark:text-zinc-300">
              You are currently signed out.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors w-full"
            >
              Sign In
            </button>
          </div>
        )}

        <div className="mt-6 w-full pt-6 border-t border-zinc-200 dark:border-zinc-800/50 text-center">
          <p className="text-sm font-mono text-zinc-800 dark:text-zinc-200">
            Backend connection: {appName ? <span className="text-green-500 font-bold">{appName}</span> : <span className="text-red-500">disconnected</span>}
          </p>
        </div>
      </main>
    </div>
  );
}
