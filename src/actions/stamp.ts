"use server";

import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfileForUserId } from "@/lib/profileDb";
import { revalidatePath } from "next/cache";

async function resolveStampUserId(anonymousUserId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user.id;
  if (anonymousUserId) return anonymousUserId;
  return null;
}

export async function getStamps(anonymousUserId?: string) {
  try {
    const targetId = await resolveStampUserId(anonymousUserId);
    if (!targetId) return [];

    const stamps = await prisma.stamp.findMany({
      where: {
        userId: targetId,
      },
      select: {
        date: true,
      },
    });
    return stamps.map((s) => s.date);
  } catch (error) {
    console.error("Failed to get stamps:", error);
    return [];
  }
}

export async function toggleStamp(anonymousUserId: string, date: string) {
  try {
    const targetId = await resolveStampUserId(anonymousUserId);
    if (!targetId) {
      return { success: false, error: "Unauthorized" };
    }

    await ensureUserProfileForUserId(targetId);

    const existing = await prisma.stamp.findFirst({
      where: {
        userId: targetId,
        date: date,
      },
    });

    if (existing) {
      await prisma.stamp.delete({
        where: {
          id: existing.id,
        },
      });
      console.log(`Deleted stamp for ${date}`);
    } else {
      await prisma.stamp.create({
        data: {
          userId: targetId,
          date: date,
        },
      });
      console.log(`Created stamp for ${date}`);
    }

    revalidatePath("/");
    console.log(`Success toggling stamp for user ${targetId} on ${date}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to toggle stamp on ${date}:`, error);
    return { success: false, error: "Failed to toggle stamp" };
  }
}
