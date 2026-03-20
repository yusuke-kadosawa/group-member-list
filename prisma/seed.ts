#!/usr/bin/env tsx
// prisma/seed.ts
// TSVファイルからPlaceテーブルにデータをインポートするスクリプト

import { PrismaClient } from '@prisma/client';
console.log('DATABASE_URL:', process.env.DATABASE_URL);
import dotenv from 'dotenv';
import path from 'path';

// .env.localを優先して読み込む（process.envにセット）
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });
// 追加: .env.localの内容をprocess.envに明示的にエクスポート
if (require.main === module) {
  const fs = require('fs');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      if (line.startsWith('#') || !line.includes('=')) continue;
      const [key, ...vals] = line.split('=');
      const value = vals.join('=');
      process.env[key.trim()] = value.trim();
    }
  }
}
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const tsvPath = path.resolve(__dirname, 'places_seed.tsv');
  if (!fs.existsSync(tsvPath)) {
    console.error('places_seed.tsv not found');
    process.exit(1);
  }
  const lines = fs.readFileSync(tsvPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const [header, ...rows] = lines;
  const columns = header.split('\t');
  const nameIdx = columns.indexOf('name');
  const latIdx = columns.indexOf('latitude');
  const lngIdx = columns.indexOf('longitude');

  for (const row of rows) {
    const cells = row.split('\t');
    const name = cells[nameIdx];
    const latitude = cells[latIdx] ? parseFloat(cells[latIdx]) : null;
    const longitude = cells[lngIdx] ? parseFloat(cells[lngIdx]) : null;
    if (!name || latitude === null || longitude === null) continue;
    await prisma.place.upsert({
      where: { latitude_longitude: { latitude, longitude } },
      update: { name },
      create: { name, latitude, longitude },
    });
    console.log(`Upserted: ${name}`);
  }
  console.log('Seed complete.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
