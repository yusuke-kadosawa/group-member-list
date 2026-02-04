import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default function Home() {
  async function handleSubmit(formData: FormData) {
    'use server';
    
    const email = formData.get('email') as string;
    
    if (!email) {
      return { error: 'メールアドレスを入力してください。' };
    }

    try {
      // メールアドレスが存在するかチェック
      const existingUser = await prisma.user.findFirst({
        where: { email }
      });

      if (!existingUser) {
        // ユーザーが存在しない場合、新規作成
        await prisma.user.create({
          data: {
            uid: email, // uidとしてemailを使用
            email,
            name: email.split('@')[0], // 簡易的な名前生成
          }
        });
        console.log('新規ユーザーとして登録しました:', email);
      } else {
        console.log('既存のユーザーです:', email);
      }

      // ダッシュボードにリダイレクト
      redirect('/dashboard?email=' + encodeURIComponent(email));
      
    } catch (error) {
      console.error('Error:', error);
      return { error: 'エラーが発生しました。' };
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-8">
          ようこそ！
        </h1>
        <p>このシステムを太平洋を漂う偶然の遭遇と離別と再会に渦巻く古の縁あるものに捧ぐ</p>
        <form action={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
          <input
            name="email"
            type="email"
            placeholder="メールアドレスを入力"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            認証
          </button>
        </form>
        <p>@{typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}</p>
      </main>
    </div>
  );
}
