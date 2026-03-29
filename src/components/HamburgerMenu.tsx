"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Trophy,
  Medal,
  Hash,
  Share2,
  LogIn,
  Settings,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { useExercise } from "@/context/ExerciseContext";
import { createClient } from "@/lib/supabase/client";
import { getAccountPrimaryLabel } from "@/lib/auth/displayName";

const getRank = (count: number) => {
  if (count >= 100) return { name: "LEGEND", color: "text-purple-500", icon: Trophy, next: null };
  if (count >= 50) return { name: "PLATINUM", color: "text-cyan-400", icon: Medal, next: 100 };
  if (count >= 30) return { name: "GOLD", color: "text-yellow-500", icon: Medal, next: 50 };
  if (count >= 10) return { name: "SILVER", color: "text-gray-400", icon: Medal, next: 30 };
  if (count >= 3) return { name: "BRONZE", color: "text-amber-700", icon: Medal, next: 10 };
  return { name: "BEGINNER", color: "text-green-500", icon: Hash, next: 3 };
};

export function HamburgerMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  // We use useExercise here just to get the totalCount and streak for display/share
  // We don't need toggleStamp or setCurrentDate here for now
  const { totalCount, streak, streakGoal } = useExercise();
  const rank = getRank(totalCount);
  const accountPreviewShort = user
    ? (() => {
        const p = getAccountPrimaryLabel(user);
        return p.length > 28 ? `${p.slice(0, 26)}…` : p;
      })()
    : "";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close menu when clicking escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
    router.refresh();
  }

  const shareToLine = () => {
    const who = user ? getAccountPrimaryLabel(user) : "";
    const head = who ? `【${who}】` : "";
    const text = `${head}FitStampで運動習慣継続中！\n🔥 連続: ${streak}日 / 目標${streakGoal}日\n🏆 現在のランク: ${rank.name}\n#FitStamp`;
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label="Menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-80 flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-900 dark:border-l dark:border-gray-800 border-l border-gray-100",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex shrink-0 items-center justify-between px-6 pb-4 pt-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {/* Account */}
          <div className="mb-8 space-y-2">
            {authLoading ? (
              <div className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ) : user ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                <div className="flex min-w-0 items-center gap-2">
                  <p
                    className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                    title={getAccountPrimaryLabel(user)}
                  >
                    {accountPreviewShort}
                  </p>
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-white hover:text-orange-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-orange-400"
                    aria-label="アカウント設定"
                    title="アカウント設定"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-100 active:scale-[0.99] dark:border-orange-900/40 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/60"
              >
                <LogIn className="h-4 w-4 shrink-0" />
                ログイン
              </Link>
            )}
          </div>

          {/* Rank Section */}
          <div className="mb-8 rounded-2xl bg-gray-50 p-6 dark:bg-gray-800/50">
            <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">現在のランク</div>
            <div className="mb-4 flex items-center gap-3">
              <rank.icon className={cn("h-8 w-8", rank.color)} />
              <div>
                <div className={cn("text-xl font-black tracking-tight", rank.color)}>{rank.name}</div>
                {rank.next && (
                  <div className="text-xs text-gray-400">
                    Next: あと{rank.next - totalCount}回
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>TOTAL STAMPS</span>
              <span className="font-bold text-gray-900 dark:text-white">{totalCount}</span>
            </div>
          </div>

          {/* Share Section */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">シェアする</div>

            <button
              onClick={shareToLine}
              className="flex w-full items-center gap-3 rounded-xl bg-[#06C755] px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#05b34c] active:scale-95"
            >
              <Share2 className="h-4 w-4" />
              LINEで送る
            </button>
          </div>
        </div>

        {user && !authLoading && (
          <div className="shrink-0 border-t border-gray-100 px-6 py-4 dark:border-gray-800">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-lg py-2.5 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-gray-800"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </>
  );
}
