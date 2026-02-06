import { signIn } from "@/app/auth"
import { redirect } from "next/navigation"

export default function SignIn({ searchParams }: { searchParams: { from?: string; email?: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 mb-8">
          ログイン
        </h1>

        <form
          method="POST"
          className="flex flex-col gap-4 w-full max-w-md"
          action={async (formData) => {
            "use server"
            const email = formData.get("email") as string
            if (!email) return

            await signIn("email", { email, redirect: false })
            redirect("/auth/check-email")
          }}
        >
          <input
            name="email"
            type="email"
            placeholder="メールアドレス"
            defaultValue={searchParams.email || ""}
            required
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            メールでログイン
          </button>
        </form>

        <div className="mt-6">
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: searchParams.from || "/home" })
            }}
          >
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Googleでログイン
            </button>
          </form>
        </div>

        <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          @{new URL(process.env.NEXTAUTH_URL || "http://localhost:3000").host}
        </p>
      </div>
    </div>
  )
}