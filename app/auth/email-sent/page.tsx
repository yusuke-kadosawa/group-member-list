"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { resendEmail } from "@/app/api/resend-email";

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-8">
          認証メールを送信しました
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          認証リンクを含むメールを送信しました。<br />
          メールを確認してリンクをクリックしてください。
        </p>

        <div className="flex gap-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (isSubmitting || !email) return;
              setIsSubmitting(true);
              try {
                await resendEmail(email);
              } catch (error) {
                console.error("メール再送信エラー", error);
              } finally {
                console.log("3秒後にボタンを有効化します");
                setTimeout(() => {
                  console.log("ボタンを有効化");
                  setIsSubmitting(false);
                }, RESEND_COOLDOWN_MS);
              }
            }}
          >
            <button
              type="submit"
              className={`px-4 py-2 rounded-md transition-colors text-white ${
                isSubmitting || !email ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={isSubmitting || !email}
            >
              メールを再送信
            </button>
          </form>

          <a
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            戻る
          </a>
        </div>
      </div>
    </div>
  );
}