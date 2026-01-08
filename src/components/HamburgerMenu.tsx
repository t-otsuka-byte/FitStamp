"use client";

import { useState, useEffect } from "react";
import { Menu, X, Trophy, Medal, Hash, ExternalLink, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExercise } from "@/context/ExerciseContext";

const getRank = (count: number) => {
  if (count >= 100) return { name: "LEGEND", color: "text-purple-500", icon: Trophy, next: null };
  if (count >= 50) return { name: "PLATINUM", color: "text-cyan-400", icon: Medal, next: 100 };
  if (count >= 30) return { name: "GOLD", color: "text-yellow-500", icon: Medal, next: 50 };
  if (count >= 10) return { name: "SILVER", color: "text-gray-400", icon: Medal, next: 30 };
  if (count >= 3) return { name: "BRONZE", color: "text-amber-700", icon: Medal, next: 10 };
  return { name: "BEGINNER", color: "text-green-500", icon: Hash, next: 3 };
};

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  // We use useExercise here just to get the totalCount and streak for display/share
  // We don't need toggleStamp or setCurrentDate here for now
  const { totalCount, streak } = useExercise();
  const rank = getRank(totalCount);

  // Close menu when clicking escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const shareToLine = () => {
    const text = `FitStampで運動習慣継続中！\n🔥 連続記録: ${streak}日\n🏆 現在のランク: ${rank.name}\n#FitStamp`;
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
          "fixed right-0 top-0 z-50 h-full w-80 bg-white p-6 shadow-2xl transition-transform duration-300 dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X className="h-6 w-6" />
          </button>
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
    </>
  );
}
