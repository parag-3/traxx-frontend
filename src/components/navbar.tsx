"use client";

import { useTheme } from "next-themes";
import { useAuth } from "./auth-provider";
import { Sun, Moon, Monitor, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

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
    if (theme === "system") return <Monitor className="w-5 h-5" />;
    if (resolvedTheme === "dark") return <Moon className="w-5 h-5" />;
    return <Sun className="w-5 h-5" />;
  };

  const handleLogout = async () => {
    await logout();
    setProfileMenuOpen(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="text-xl font-bold tracking-tight text-black dark:text-white hover:opacity-80 transition-opacity"
        >
          traxx
        </button>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle theme"
            >
              {themeIcon()}
            </button>

            {themeMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg py-1 animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => { setTheme("light"); setThemeMenuOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${theme === "light" ? "text-blue-600 dark:text-blue-400" : "text-zinc-700 dark:text-zinc-300"}`}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button
                  onClick={() => { setTheme("dark"); setThemeMenuOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${theme === "dark" ? "text-blue-600 dark:text-blue-400" : "text-zinc-700 dark:text-zinc-300"}`}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
                <button
                  onClick={() => { setTheme("system"); setThemeMenuOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${theme === "system" ? "text-blue-600 dark:text-blue-400" : "text-zinc-700 dark:text-zinc-300"}`}
                >
                  <Monitor className="w-4 h-4" /> System
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
                  className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
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
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg py-1 animate-in fade-in slide-in-from-top-1">
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
