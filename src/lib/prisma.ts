import { PrismaClient } from "@prisma/client";

// Prisma 7系以降: Postgres接続はprisma.config.tsで管理されるため、
// ここでは単純にPrismaClientを初期化すればOK
// DATABASE_URLは環境変数から自動で取得される

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
