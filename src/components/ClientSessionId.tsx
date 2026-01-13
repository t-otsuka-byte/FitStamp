'use client';

import { useExercise } from "@/context/ExerciseContext";

export function ClientSessionId() {
  const { userId } = useExercise();
  if (!userId) return "Loading...";
  return <>{userId}</>;
}
