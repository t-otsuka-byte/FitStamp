"use server";

import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type MergeResult =
  | { success: true; merged: number }
  | { success: false; error: string };

/** RFC 4122-style UUID (e.g. `crypto.randomUUID()`, Supabase `user.id`). */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id: string): boolean {
  const s = id.trim();
  return s.length === 36 && UUID_RE.test(s);
}

/**
 * Moves Stamp rows from anonymousUserId to the authenticated user.
 * Requires a valid session; `anonymousUserId` must be a well-formed UUID (same shape as localStorage IDs).
 *
 * Conflict resolution for (authUserId, date): delete the authenticated user's stamp on that date first,
 * then reassign anonymous rows — anonymous wins for overlapping dates (one row per date after merge).
 */
export async function mergeAnonymousStamps(
  anonymousUserId: string,
): Promise<MergeResult> {
  const trimmed = anonymousUserId?.trim() ?? "";
  if (!trimmed) {
    return { success: true, merged: 0 };
  }

  if (!isValidUuid(trimmed)) {
    return { success: false, error: "Invalid anonymous user id" };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const authId = user.id;
  if (trimmed === authId) {
    return { success: true, merged: 0 };
  }

  const anonymousStamps = await prisma.stamp.findMany({
    where: { userId: trimmed },
    select: { date: true },
  });

  if (anonymousStamps.length === 0) {
    return { success: true, merged: 0 };
  }

  const dates = [...new Set(anonymousStamps.map((s) => s.date))];

  const merged = await prisma.$transaction(async (tx) => {
    await tx.stamp.deleteMany({
      where: {
        userId: authId,
        date: { in: dates },
      },
    });

    const result = await tx.stamp.updateMany({
      where: { userId: trimmed },
      data: { userId: authId },
    });

    return result.count;
  });

  revalidatePath("/");
  return { success: true, merged };
}
