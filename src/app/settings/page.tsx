"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { syncProfileDisplayNameFromSession } from "@/actions/profile";
import {
  DISPLAY_NAME_MAX_LENGTH,
  getDisplayNameFromUser,
  validateDisplayNameInput,
} from "@/lib/auth/displayName";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [draftDisplayName, setDraftDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      setLoading(false);
      if (u) setDraftDisplayName(getDisplayNameFromUser(u));
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null;
      setUser(next);
      if (next) setDraftDisplayName(getDisplayNameFromUser(next));
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  async function handleSave() {
    if (!user) return;
    const err = validateDisplayNameInput(draftDisplayName);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const trimmed = draftDisplayName.trim();
    const { data, error: upErr } = await supabase.auth.updateUser({
      data: { display_name: trimmed },
    });
    setSaving(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    if (data.user) setUser(data.user);
    await syncProfileDisplayNameFromSession();
    router.push("/");
    router.refresh();
  }

  function handleCancel() {
    if (saving) return;
    router.push("/");
    router.refresh();
  }

  if (loading || !user) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col justify-center px-4 py-12">
        <div className="h-32 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        アカウント設定
      </h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        表示名はメニューやシェア文などに使われます。
      </p>

      <div className="space-y-6 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div>
          <label
            htmlFor="settings-display-name"
            className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            表示名
          </label>
          <input
            id="settings-display-name"
            type="text"
            autoComplete="nickname"
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            value={draftDisplayName}
            onChange={(e) => setDraftDisplayName(e.target.value)}
            placeholder="例: たろう"
            className="w-full rounded-xl border border-orange-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-700 dark:bg-black dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-400">
            空にするとメールアドレスが表示に使われます。
          </p>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            メールアドレス
          </div>
          <p className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {user.email ?? "—"}
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white shadow-md transition-opacity disabled:opacity-50"
          >
            {saving ? "保存中…" : "保存する"}
          </button>
        </div>
      </div>
    </div>
  );
}
