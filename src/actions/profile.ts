"use server";

import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** 設定画面保存後など、セッションの display_name を DB の UserProfile に反映する */
export async function syncProfileDisplayNameFromSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "Not authenticated" };
  const raw = user.user_metadata?.display_name;
  const displayName =
    typeof raw === "string" && raw.trim() ? raw.trim() : null;
  await prisma.userProfile.upsert({
    where: { id: user.id },
    create: { id: user.id, displayName },
    update: { displayName },
  });
  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true as const };
}
