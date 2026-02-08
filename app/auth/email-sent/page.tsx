export default function EmailSent() {
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
          <form action={async () => {
            "use server"
            // TODO: メール再送信機能を実装
          }}>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
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
  )
}