import type { User } from "@supabase/supabase-js";

const MAX_LEN = 40;

export function getDisplayNameFromUser(user: User): string {
  const raw = user.user_metadata?.display_name;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return "";
}

/** メイン表示用（表示名がなければメール） */
export function getAccountPrimaryLabel(user: User): string {
  const name = getDisplayNameFromUser(user);
  if (name) return name;
  return user.email ?? user.id;
}

export function validateDisplayNameInput(value: string): string | null {
  const t = value.trim();
  if (t.length > MAX_LEN) {
    return `表示名は${MAX_LEN}文字以内にしてください`;
  }
  return null;
}

export const DISPLAY_NAME_MAX_LENGTH = MAX_LEN;
