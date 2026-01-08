"use client";

import { useState, useEffect } from "react";
import { Sparkles, Quote } from "lucide-react";

const QUOTES = [
  { text: "継続は力なり", author: "ことわざ" },
  { text: "千里の道も一歩から", author: "老子" },
  { text: "努力する人は希望を語り、怠ける人は不満を語る", author: "井上靖" },
  { text: "小さいことを重ねることが、とんでもないところに行くただひとつの道", author: "イチロー" },
  { text: "努力した者が全て報われるとは限らない。しかし、成功した者は皆すべからく努力している", author: "鴨川源二" },
  { text: "明日やろうは馬鹿野郎", author: "ドラマ『プロポーズ大作戦』" },
  { text: "天才とは、1％のひらめきと99％の努力である", author: "トーマス・エジソン" },
  { text: "あきらめたらそこで試合終了ですよ…？", author: "安西先生『SLAM DUNK』" },
  { text: "努力できることが才能である", author: "松井秀喜" },
  { text: "一回一回の練習に対して、自分なりのテーマを持って取り組んでいるか", author: "本田圭佑" },
  { text: "ステップ・バイ・ステップ。どんなことでも、何かを達成する場合、とるべき方法はただひとつ、一歩ずつ着実に立ち向かうことだ", author: "マイケル・ジョーダン" },
  { text: "努力せずに何かできるようになる人のことを「天才」というのなら、僕はそうじゃない。努力した結果、何かができるようになる人のことを「天才」というのなら、僕はそうだと思う", author: "イチロー" },
  { text: "神様は乗り越えられない試練は与えない", author: "ドラマ『JIN-仁-』" },
  { text: "昨日の自分より、今日の自分。今日の自分より、明日の自分", author: "ローランド" },
  { text: "一生懸命だと知恵が出る。中途半端だと愚痴が出る。いい加減だと言い訳が出る", author: "武田信玄" },
  { text: "何かに挑戦したら確実に報われるのであれば、誰でも必ず挑戦するだろう。報われないかもしれないところで、同じ情熱、気力、モチベーションをもって継続しているのは非常に大変なことであり、私は、それこそが才能だと思っている", author: "羽生善治" },
];

export function QuoteDisplay() {
  const [quote, setQuote] = useState(QUOTES[0]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Randomly select a quote on mount
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    // Change quote every minute (60000ms)
    const interval = setInterval(() => {
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const changeQuote = () => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  };

  if (!isClient) {
    return (
      <div className="rounded-lg bg-orange-50 p-6 dark:bg-orange-950/30">
        <h3 className="mb-2 font-semibold text-orange-800 dark:text-orange-200">
          今日の言葉
        </h3>
        <p className="text-sm text-orange-700 dark:text-orange-300">
          読み込み中...
        </p>
      </div>
    );
  }

  return (
    <div 
      onClick={changeQuote}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-95 dark:from-orange-900/40 dark:to-gray-900"
      role="button"
      aria-label="新しい名言を表示"
    >
      <div className="absolute right-3 top-3 opacity-10 transition-transform group-hover:rotate-12 group-hover:opacity-20">
        <Quote className="h-10 w-10 text-orange-500" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
          <Sparkles className="h-3 w-3" />
          <span>Daily Wisdom</span>
        </div>
        
        <figure className="text-center">
          <blockquote className="mb-2 text-base font-medium leading-relaxed text-gray-800 dark:text-gray-100">
            "{quote.text}"
          </blockquote>
          <figcaption className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <span className="h-px w-6 bg-orange-300 dark:bg-orange-700"></span>
            {quote.author}
            <span className="h-px w-6 bg-orange-300 dark:bg-orange-700"></span>
          </figcaption>
        </figure>

        <div className="mt-3 text-[10px] font-medium text-orange-400 opacity-0 transition-opacity group-hover:opacity-100">
          タップして更新 ↻
        </div>
      </div>
    </div>
  );
}
