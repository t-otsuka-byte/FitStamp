"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { format, subDays } from "date-fns";
import confetti from "canvas-confetti";

interface ExerciseContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  stampedDates: string[];
  streak: number;
  monthlyCount: number;
  toggleStamp: (date: Date) => void;
  totalCount: number;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

import { getStamps, toggleStamp as toggleStampAction } from "@/actions/stamp";

export function ExerciseProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stampedDates, setStampedDates] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [userId, setUserId] = useState<string>("");

  // Initialize
  useEffect(() => {
    setIsClient(true);
    // Get or create anonymous user ID
    let id = localStorage.getItem("fitstamp-user-id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("fitstamp-user-id", id);
    }
    setUserId(id);

    // Fetch stamps from DB
    getStamps(id).then((dates) => {
      setStampedDates(dates);
    });
  }, []);

  // Sync calculations (Streak & Monthly Count)
  useEffect(() => {
    // Calculate Streak
    let currentStreak = 0;
    const sortedDates = [...stampedDates].sort().reverse();
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");
    
    if (stampedDates.includes(todayStr) || stampedDates.includes(yesterdayStr)) {
      let checkDate = stampedDates.includes(todayStr) ? new Date() : subDays(new Date(), 1);
      while (true) {
        const checkStr = format(checkDate, "yyyy-MM-dd");
        if (stampedDates.includes(checkStr)) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
    }
    setStreak(currentStreak);

    // Calculate Monthly Count
    const yearMonth = format(currentDate, "yyyy-MM");
    const count = stampedDates.filter(d => d.startsWith(yearMonth)).length;
    setMonthlyCount(count);

  }, [stampedDates, currentDate]);

  const toggleStamp = async (date: Date) => {
    if (!userId) return;

    const dateStr = format(date, "yyyy-MM-dd");
    const isAdding = !stampedDates.includes(dateStr);
    
    // Optimistic update
    if (isAdding) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fb923c', '#f87171', '#fbbf24']
      });
    }

    setStampedDates((prev) => {
      if (prev.includes(dateStr)) {
        return prev.filter((d) => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });

    // Call Server Action
    await toggleStampAction(userId, dateStr);
  };


  return (
    <ExerciseContext.Provider value={{
      currentDate,
      setCurrentDate,
      stampedDates,
      streak,
      monthlyCount,
      toggleStamp,
      totalCount: stampedDates.length
    }}>
      {children}
    </ExerciseContext.Provider>
  );
}

export function useExercise() {
  const context = useContext(ExerciseContext);
  if (context === undefined) {
    throw new Error("useExercise must be used within an ExerciseProvider");
  }
  return context;
}
