import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

/** Stamp 作成前に必須。認証ユーザーは Supabase の表示名を同期、匿名は displayName なしで作成。 */
export async function ensureUserProfileForUserId(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id === userId) {
    const raw = user.user_metadata?.display_name;
    const displayName =
      typeof raw === "string" && raw.trim() ? raw.trim() : null;
    await prisma.userProfile.upsert({
      where: { id: userId },
      create: { id: userId, displayName },
      update: { displayName },
    });
  } else {
    await prisma.userProfile.upsert({
      where: { id: userId },
      create: { id: userId, displayName: null },
      update: {},
    });
  }
}
