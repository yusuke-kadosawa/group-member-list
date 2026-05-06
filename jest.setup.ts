// テスト環境用.env.testを読み込む（PrismaClient初期化より前に必ず実行）
const dotenv = require('dotenv');
dotenv.config({ path: '.env.test' });

// テスト開始時にDB初期化
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

beforeAll(async () => {
  // テーブル名は必要に応じて追加
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "group_users", "groups", "users", "emails", "activity_groups", "group_invites", "verificationtokens", "places", "activity_templates" RESTART IDENTITY CASCADE');
});
import { TextEncoder, TextDecoder } from 'util';

// Node.js環境でTextEncoder/TextDecoderをグローバルに定義（Jest用）
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any;
}
