import { auth } from "@/app/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getSession(): Promise<any> {
  let session: any = undefined;

  if (typeof auth === "function") {
    session = await auth();
  }

  if (!session) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("next-auth.session-token")?.value;
      if (token) {
        const dbSession = await prisma.session.findUnique({
          where: { sessionToken: token },
          include: { user: true },
        });
        if (dbSession && dbSession.expires > new Date()) {
          session = {
            user: {
              id: dbSession.user.id,
              name: dbSession.user.name,
              email: dbSession.user.email,
            },
          };
        }
      }
    } catch (e) {
      console.error("session fallback error", e);
    }
  }

  return session;
}

type SessionWithUser = {
  session: {
    id: string
    sessionToken: string
    expires: Date | null
    userId: string
  }
  user: {
    id: string
    uid: string
    email?: string | null
    name?: string | null
    image?: string | null
  }
}

/**
 * サーバー側で Cookie から NextAuth のセッショントークンを読み取り、DB からセッションとユーザーを取得します。
 * 戻り値が null の場合は認証されていません。
 */
export async function getServerSession(): Promise<SessionWithUser | null> {
  const cookieStore = await cookies()
  const token =
    cookieStore.get('__Secure-next-auth.session-token')?.value ??
    cookieStore.get('next-auth.session-token')?.value ??
    null

  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  })

  if (!session) return null
  if (session.expires && session.expires < new Date()) return null

  return { session: { id: session.id as unknown as string, sessionToken: session.sessionToken, expires: session.expires, userId: String(session.userId) }, user: session.user as any }
}

/**
 * サーバー側で認証が必須な処理に対して使用します。
 * 認証されていなければ `redirectTo` にリダイレクトします。
 */
export async function requireServerSession(redirectTo = "/auth/signin") {
  const s = await getSession();
  if (!s) redirect(`${redirectTo}`);
  return s;
}

/**
 * クライアント側でセッションを使用したい場合は NextAuth の `useSession` を推奨します。
 */
export default getServerSession
