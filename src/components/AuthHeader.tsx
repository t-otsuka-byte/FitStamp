"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function AuthHeader() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="h-10 w-20 animate-pulse rounded-lg bg-orange-50 dark:bg-gray-800" />
    );
  }

  if (user) {
    const label = user.email ?? user.id;
    const short =
      label.length > 22 ? `${label.slice(0, 20)}…` : label;

    return (
      <div className="flex max-w-40 flex-col items-end gap-0.5 text-right">
        <span
          className="truncate text-xs text-gray-600 dark:text-gray-400"
          title={label}
        >
          {short}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-xs font-medium text-orange-600 hover:underline dark:text-orange-400"
        >
          ログアウト
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-gray-800"
    >
      ログイン
    </Link>
  );
}
