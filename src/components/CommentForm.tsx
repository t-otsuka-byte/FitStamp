'use client';

import { createComment, getComments } from '@/actions/comment';
import { useState, useEffect } from 'react';

export function CommentForm() {
  const [isPending, setIsPending] = useState(false);
  const [recentComments, setRecentComments] = useState<any[]>([]);

  useEffect(() => {
    getComments().then(setRecentComments);
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await createComment(formData);
      // 再取得
      const updated = await getComments();
      setRecentComments(updated);
      // 入力欄をクリア
      const form = document.querySelector('form') as HTMLFormElement;
      form?.reset();
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="w-full max-w-md mt-12 p-6 bg-white rounded-2xl shadow-sm border border-orange-100">
      <h3 className="text-lg font-bold text-orange-600 mb-4 text-center">
        フィードバック / コメント
      </h3>
      <form action={handleSubmit} className="flex flex-col gap-3">
        <textarea
          name="comment"
          placeholder="コメントを入力してください..."
          className="w-full p-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px] resize-none text-sm"
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {isPending ? '送信中...' : '送信する'}
        </button>
      </form>

      {recentComments.length > 0 && (
        <div className="mt-8 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">最近のコメント</p>
          {recentComments.slice(0, 3).map((c) => (
            <div key={c.id} className="p-3 bg-orange-50 rounded-lg text-sm text-gray-700 border border-orange-100 text-left">
              {c.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
