"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { resendEmail } from "@/app/api/resend-email";

export default function EmailSent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const email = session?.user?.email;

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
                setTimeout(() => setIsSubmitting(false), 3000); // 3秒間ボタンを無効化
              }
            }}
          >
            <button
              type="submit"
              className={`px-4 py-2 rounded-md transition-colors text-white ${
                isSubmitting || !email ? "bg-gray-400 cursor-not-allowed" : "bg-gray-500 hover:bg-gray-600"
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