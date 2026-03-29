"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage(
          "確認メールを送信しました。メール内のリンクを開いてからログインしてください（確認をオフにしている場合はそのままログインできます）。",
        );
        setMode("login");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-center text-2xl font-bold text-orange-600">
        FitStamp
      </h1>
      <p className="mb-8 text-center text-sm text-gray-500">
        アカウントでログインしてスタンプを同期
      </p>

      <div className="mb-6 flex rounded-xl bg-orange-50 p-1 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
            setMessage(null);
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            mode === "login"
              ? "bg-white text-orange-600 shadow dark:bg-gray-900"
              : "text-gray-500"
          }`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError(null);
            setMessage(null);
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            mode === "signup"
              ? "bg-white text-orange-600 shadow dark:bg-gray-900"
              : "text-gray-500"
          }`}
        >
          新規登録
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-xs font-medium text-gray-600"
          >
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-orange-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-xs font-medium text-gray-600"
          >
            パスワード
          </label>
          <input
            id="password"
            type="password"
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-orange-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white shadow-md transition-opacity disabled:opacity-50"
        >
          {loading
            ? "処理中..."
            : mode === "signup"
              ? "登録する"
              : "ログイン"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm">
        <Link
          href="/"
          className="text-orange-600 underline-offset-2 hover:underline"
        >
          トップに戻る
        </Link>
      </p>
    </div>
  );
}
