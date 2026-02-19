import LoginForm from '@/app/components/LoginForm';

export default function Home() {
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
