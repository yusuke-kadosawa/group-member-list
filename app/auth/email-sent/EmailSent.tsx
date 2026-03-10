"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const RESEND_COOLDOWN_MS = 3000; // 再送信クールダウン時間（ミリ秒）

export default function EmailSent() {
  const [isSubmitting, setIsSubmitting] = useState(true); // 初期状態を無効に
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  console.log("email:", email);

  useEffect(() => {
    // ページ遷移直後に3秒待って有効化
    const timer = setTimeout(() => {
      setIsSubmitting(false);
    }, RESEND_COOLDOWN_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleResend = async () => {
    if (isSubmitting || !email) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        console.log("メールを再送信しました");
      } else {
        console.error("メール再送信エラー", await res.text());
      }
    } catch (error) {
      console.error("メール再送信エラー", error);
    } finally {
      console.log("3秒後にボタンを有効化します");
      setTimeout(() => {
        console.log("ボタンを有効化");
        setIsSubmitting(false);
      }, RESEND_COOLDOWN_MS);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-8">
          {/* ...省略... */}
        </h1>
      </div>
    </div>
  );
}
