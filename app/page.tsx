import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import LoginForm from '@/app/components/LoginForm';

export default async function Home() {
  // サーバー側で cookie を確認し、DB の sessions を検証してから表示またはリダイレクトする
  try {
    // Next.js の警告に従い cookies() は await してから使用する
    const cookieStore = await cookies();
    const token = cookieStore.get('next-auth.session-token')?.value;
    if (token) {
      const dbSession = await prisma.session.findUnique({ where: { sessionToken: token }, include: { user: true } });
      if (dbSession && dbSession.expires > new Date()) {
        // 有効なセッションがあればサーバー側で直接 /home にリダイレクト
        redirect('/home');
      }
    }
  } catch (e: any) {
    // redirect は内部的に NEXT_REDIRECT エラーを投げるため、それは再スローして Next に処理させる
    if (e && (e.message === 'NEXT_REDIRECT' || (typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')))) throw e;
    console.error('root page session check error', e);
  }
  // Login is handled by client-side LoginForm -> POST /api/login

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-8">
          ようこそ！
        </h1>
        <p>このシステムを太平洋を漂う偶然の遭遇と離別と再会に渦巻く古の縁あるものに捧ぐ</p>
        <LoginForm />
        <p>@{typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}</p>
      </main>
    </div>
  );
}
