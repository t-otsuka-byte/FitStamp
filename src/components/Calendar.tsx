"use client";

import { useState, useEffect } from "react";
import {
  format,
  getDaysInMonth,
  startOfMonth,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { ja } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Flame,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useExercise } from "@/context/ExerciseContext";

interface CalendarProps {
  className?: string;
}

export function Calendar({ className }: CalendarProps) {
  const {
    currentDate,
    setCurrentDate,
    stampedDates,
    streak,
    streakGoal,
    setStreakGoal,
    toggleStamp,
  } = useExercise();

  const [goalOpen, setGoalOpen] = useState(false);
  const [draftGoal, setDraftGoal] = useState(String(streakGoal));

  useEffect(() => {
    if (goalOpen) setDraftGoal(String(streakGoal));
  }, [goalOpen, streakGoal]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = startOfMonth(currentDate).getDay(); // 0 = Sunday

  const days = [];
  // Empty slots for days before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  return (
    <div className={cn("w-full max-w-md", className)}>
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setGoalOpen(true)}
          className="flex w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 p-4 text-white shadow-lg shadow-orange-500/20 transition-transform hover:scale-[1.02] active:scale-95"
        >
          <div className="mb-1 flex items-center gap-2 opacity-90">
            <Flame className="h-5 w-5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">
              連続の目標
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black tabular-nums tracking-tight">
              {streakGoal}
            </span>
            <span className="text-sm font-bold opacity-80">日</span>
          </div>
          <span className="mt-1 text-[11px] opacity-80">
            現在 {streak} 日連続
          </span>
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-xl shadow-gray-200/50 dark:bg-gray-900 dark:shadow-none">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {format(currentDate, "yyyy年M月", { locale: ja })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="rounded-full border border-gray-100 p-2 hover:bg-gray-50 active:scale-95 dark:border-gray-800 dark:hover:bg-gray-800"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextMonth}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-sm font-medium text-gray-500">
        <div>日</div>
        <div>月</div>
        <div>火</div>
        <div>水</div>
        <div>木</div>
        <div>金</div>
        <div>土</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;

          const dateStr = format(date, "yyyy-MM-dd");
          const isStamped = stampedDates.includes(dateStr);
          const isTodayDate = isToday(date);

          return (
            <button
              key={dateStr}
              onClick={() => toggleStamp(date)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-all active:scale-95",
                isTodayDate && !isStamped && "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-900",
                isStamped
                  ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/30"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750"
              )}
            >
              <span className={cn("font-semibold", isStamped && "opacity-90")}>{date.getDate()}</span>
              {isStamped && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-6 w-6 animate-in zoom-in duration-200" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>

      {goalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="streak-goal-title"
          onClick={() => setGoalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="streak-goal-title"
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                連続の目標
              </h2>
              <button
                type="button"
                onClick={() => setGoalOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6 flex items-baseline gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={3}
                value={draftGoal}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
                  setDraftGoal(digits);
                }}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-2xl font-bold tabular-nums text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <span className="shrink-0 text-lg font-medium text-gray-600 dark:text-gray-300">
                日
              </span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGoalOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  const n = parseInt(draftGoal, 10);
                  if (!Number.isNaN(n)) setStreakGoal(n);
                  setGoalOpen(false);
                }}
                className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
