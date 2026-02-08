"use server";

import { prisma } from "@/lib/prisma";

export async function resendEmail(email: string) {
  try {
    const existingToken = await prisma.verificationToken.findFirst({
      where: { identifier: email },
    });

    if (existingToken) {
      const newExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1時間延長
      await prisma.verificationToken.update({
        where: { token: existingToken.token },
        data: { expires: newExpires },
      });
      console.log("トークンの有効期限を延長しました:", newExpires.toISOString());
    } else {
      throw new Error("トークンが存在しません");
    }
  } catch (error) {
    console.error("メール再送信エラー:", error);
    throw new Error("メール再送信に失敗しました");
  }
}