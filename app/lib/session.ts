import { cookies } from "next/headers";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

export async function getSession(): Promise<any> {
  let session: any = undefined;

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
    console.error("session error", e);
  }

  return session;
}

export const getServerSession = getSession;
