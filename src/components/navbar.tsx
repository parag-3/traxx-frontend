"use client";

import { useTheme } from "next-themes";
import { useAuth } from "./auth-provider";
import { Sun, Moon, Monitor, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Logo } from "./logo";

export function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themeIcon = () => {
    if (!mounted) return <div className="w-5 h-5" />;
    if (theme === "system") return <Monitor className="w-4 h-4 text-emerald-500" />;
    if (resolvedTheme === "dark") return <Moon className="w-4 h-4 text-cyan-400" />;
    return <Sun className="w-4 h-4 text-amber-500" />;
  };

  const handleLogout = async () => {
    await logout();
    setProfileMenuOpen(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#090b10]/85 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div onClick={() => router.push("/")} className="cursor-pointer">
          <Logo size="md" showText={true} />
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Theme toggle */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50 dark:bg-[#12151f] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#181d2a] hover:border-zinc-300 dark:hover:border-white/[0.15] transition-all shadow-xs"
              aria-label="Toggle theme"
            >
              {themeIcon()}
            </button>

            {themeMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-2xl border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-[#12151f] shadow-xl dark:shadow-black/60 p-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                <button
                  onClick={() => { setTheme("light"); setThemeMenuOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-[#181d2a] transition-colors ${theme === "light" ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30" : "text-zinc-700 dark:text-zinc-300"}`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Light
                </button>
                <button
                  onClick={() => { setTheme("dark"); setThemeMenuOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-[#181d2a] transition-colors ${theme === "dark" ? "text-cyan-400 bg-cyan-950/30" : "text-zinc-700 dark:text-zinc-300"}`}
                >
                  <Moon className="w-3.5 h-3.5 text-cyan-400" /> Dark
                </button>
                <button
                  onClick={() => { setTheme("system"); setThemeMenuOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-[#181d2a] transition-colors ${theme === "system" ? "text-emerald-400 bg-emerald-950/30" : "text-zinc-700 dark:text-zinc-300"}`}
                >
                  <Monitor className="w-3.5 h-3.5 text-emerald-500" /> System
                </button>
              </div>
            )}
          </div>

          {/* Profile / Auth */}
          {!loading && (
            user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-white/[0.15] hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors shadow-xs"
                >
                  {user.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-300">
                      {user.name?.charAt(0)}
                    </div>
                  )}
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 shadow-lg dark:shadow-black/40 py-1 animate-in fade-in slide-in-from-top-1">
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                Sign In
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
