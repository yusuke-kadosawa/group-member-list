import LoginForm from '@/app/components/LoginForm';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function Home() {
  // セッションチェック: 認証済みなら /home にリダイレクト
  const session = await getSession();
  const host = (await headers()).get('host') ?? 'localhost:3000';
  if (session) {
    redirect('/home');
  }

  const dbAvailable = !!process.env.DATABASE_URL;

  // 未認証: ログインフォームを表示
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-8">
          ようこそ！
        </h1>
        <p>このシステムを太平洋を漂う偶然と奇跡の織りなす物語の登場人物の優しい声と言葉にそっと贈ります。</p>
        <LoginForm dbAvailable={dbAvailable} />
        <p>@{host}</p>
      </main>
    </div>
  );
}
