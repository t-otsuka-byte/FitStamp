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
  monthlyCount: number;
  toggleStamp: (date: Date) => void;
  totalCount: number;
  userId: string;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "fitstamp-user-id";

export function ExerciseProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stampedDates, setStampedDates] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");

  const { streak, monthlyCount } = useMemo(() => {
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

    const yearMonth = format(currentDate, "yyyy-MM");
    const count = stampedDates.filter((d) => d.startsWith(yearMonth)).length;
    return { streak: currentStreak, monthlyCount: count };
  }, [stampedDates, currentDate]);

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
        monthlyCount,
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
