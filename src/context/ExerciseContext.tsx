"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { format, subDays } from "date-fns";
import confetti from "canvas-confetti";

import { createClient } from "@/lib/supabase/client";
import { getStamps, toggleStamp as toggleStampAction } from "@/actions/stamp";
import { mergeAnonymousStamps } from "@/actions/mergeStamps";

interface ExerciseContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  stampedDates: string[];
  streak: number;
  /** 連続記録の目標日数（ユーザー設定・localStorage） */
  streakGoal: number;
  setStreakGoal: (days: number) => void;
  toggleStamp: (date: Date) => void;
  totalCount: number;
  userId: string;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "fitstamp-user-id";
const STREAK_GOAL_KEY = "fitstamp-streak-goal";
const STREAK_GOAL_DEFAULT = 7;
const STREAK_GOAL_MIN = 1;
const STREAK_GOAL_MAX = 365;

function clampStreakGoal(n: number) {
  return Math.min(
    STREAK_GOAL_MAX,
    Math.max(STREAK_GOAL_MIN, Math.round(Number(n)) || STREAK_GOAL_DEFAULT),
  );
}

export function ExerciseProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stampedDates, setStampedDates] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [streakGoal, setStreakGoalState] = useState(STREAK_GOAL_DEFAULT);

  const streak = useMemo(() => {
    let currentStreak = 0;
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");

    if (
      stampedDates.includes(todayStr) ||
      stampedDates.includes(yesterdayStr)
    ) {
      let checkDate = stampedDates.includes(todayStr)
        ? new Date()
        : subDays(new Date(), 1);
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

    return currentStreak;
  }, [stampedDates]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STREAK_GOAL_KEY);
    if (raw !== null) {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n)) {
        setStreakGoalState(clampStreakGoal(n));
      }
    }
  }, []);

  const setStreakGoal = (days: number) => {
    const next = clampStreakGoal(days);
    setStreakGoalState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STREAK_GOAL_KEY, String(next));
    }
  };

  useEffect(() => {
    const supabase = createClient();

    function ensureAnonymousId(): string {
      let id = localStorage.getItem(STORAGE_KEY);
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, id);
      }
      return id;
    }

    async function migrateExerciseStampsFromLocalStorage(
      targetUserId: string,
    ) {
      const oldStamps = localStorage.getItem("exercise-stamps");
      if (!oldStamps) return;

      try {
        const dates = JSON.parse(oldStamps) as string[];
        if (Array.isArray(dates) && dates.length > 0) {
          for (const d of dates) {
            await toggleStampAction(targetUserId, d);
          }
        }
        localStorage.removeItem("exercise-stamps");
      } catch (e) {
        console.error("Migration failed:", e);
      }
    }

    async function loadStampsForUser(
      effectiveId: string,
      useSession: boolean,
    ) {
      await migrateExerciseStampsFromLocalStorage(effectiveId);
      const dbStamps = useSession
        ? await getStamps()
        : await getStamps(effectiveId);
      setStampedDates(dbStamps);
    }

    async function bootstrap() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const uid = session.user.id;
        setUserId(uid);
        const anonId = localStorage.getItem(STORAGE_KEY);
        if (anonId && anonId !== uid) {
          await mergeAnonymousStamps(anonId);
        }
        localStorage.removeItem(STORAGE_KEY);
        await loadStampsForUser(uid, true);
        return;
      }

      const anonId = ensureAnonymousId();
      setUserId(anonId);
      await loadStampsForUser(anonId, false);
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const uid = session.user.id;
        setUserId(uid);
        const anon = localStorage.getItem(STORAGE_KEY);
        if (anon && anon !== uid) {
          await mergeAnonymousStamps(anon);
          localStorage.removeItem(STORAGE_KEY);
        }
        await loadStampsForUser(uid, true);
        return;
      }

      if (event === "SIGNED_OUT") {
        const newAnon = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, newAnon);
        setUserId(newAnon);
        await loadStampsForUser(newAnon, false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleStamp = async (date: Date) => {
    if (!userId) return;

    const dateStr = format(date, "yyyy-MM-dd");
    const isAdding = !stampedDates.includes(dateStr);

    if (isAdding) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#fb923c", "#f87171", "#fbbf24"],
      });
    }

    setStampedDates((prev) => {
      if (prev.includes(dateStr)) {
        return prev.filter((d) => d !== dateStr);
      }
      return [...prev, dateStr];
    });

    const result = await toggleStampAction(userId, dateStr);
    if (result && !result.success) {
      console.error("Failed to save stamp to DB, rolling back...");
      setStampedDates((prev) => {
        if (prev.includes(dateStr)) {
          return prev.filter((d) => d !== dateStr);
        }
        return [...prev, dateStr];
      });
    }
  };

  return (
    <ExerciseContext.Provider
      value={{
        currentDate,
        setCurrentDate,
        stampedDates,
        streak,
        streakGoal,
        setStreakGoal,
        toggleStamp,
        totalCount: stampedDates.length,
        userId,
      }}
    >
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
