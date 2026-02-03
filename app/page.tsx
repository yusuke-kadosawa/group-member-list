'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [host, setHost] = useState('');

  useEffect(() => {
    setHost(window.location.host);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-8">
          ようこそ！
        </h1>
        <p>このシステムを太平洋を漂う偶然の遭遇と離別と再会に渦巻く古の縁あるものに捧ぐ</p>
        <form className="flex flex-col gap-4 w-full max-w-md">
          <input
            type="email"
            placeholder="メールアドレスを入力"
            disabled
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            required
          />
          <button
            type="submit"
            disabled
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            認証
          </button>
        </form>
        <p>@{host}</p>
      </main>
    </div>
  );
}
