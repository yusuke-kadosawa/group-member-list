import NextAuth from "next-auth"
import Email from "next-auth/providers/email"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Email({
      server: process.env.NODE_ENV === 'development' ? {
        host: 'localhost',
        port: 1025,
        secure: false,
        ignoreTLS: true,
      } : {
        host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || "dummy@example.com",
          pass: process.env.EMAIL_SERVER_PASSWORD || "dummy-password",
        },
      },
      from: process.env.EMAIL_FROM || "noreply@example.com",
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  pages: {
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider === "email" && email) {
        return `/auth/email-sent?email=${encodeURIComponent(email)}`;
      }
      return true;
    },
  },
})