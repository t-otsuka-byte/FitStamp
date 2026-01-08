"use client";

import * as React from "react";
import { 
  format, getDaysInMonth, startOfMonth, addMonths, subMonths, isToday, isSameDay
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check, Trophy, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useExercise } from "@/context/ExerciseContext";

interface CalendarProps {
  className?: string;
}

export function Calendar({ className }: CalendarProps) {
  const { 
    currentDate, setCurrentDate, stampedDates, streak, monthlyCount, toggleStamp 
  } = useExercise();

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
      {/* Stats Section */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        {/* Streak Card */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 p-4 text-white shadow-lg shadow-orange-500/20 transition-transform hover:scale-105">
          <div className="mb-1 flex items-center gap-2 opacity-90">
            <Flame className="h-5 w-5 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">連続記録</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black tracking-tight">{streak}</span>
            <span className="text-sm font-bold opacity-80">日</span>
          </div>
        </div>
        
        {/* Monthly Count Card */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-lg shadow-gray-200/50 ring-1 ring-gray-100 transition-transform hover:scale-105 dark:bg-gray-900 dark:shadow-none dark:ring-gray-800">
          <div className="mb-1 flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-xs font-bold uppercase tracking-wider">今月の達成</span>
          </div>
          <div className="flex items-baseline gap-1 text-gray-900 dark:text-white">
            <span className="text-4xl font-black tracking-tight">{monthlyCount}</span>
            <span className="text-sm font-bold text-gray-500 dark:text-gray-500">回</span>
          </div>
        </div>
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
    </div>
  );
}
