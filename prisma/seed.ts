#!/usr/bin/env tsx
// prisma/seed.ts
// TSVファイルからPlaceテーブルにデータをインポートするスクリプト

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// .env.localを優先して読み込む
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

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

  if (nameIdx === -1 || latIdx === -1 || lngIdx === -1) {
    console.error('TSV header must include name, latitude, longitude');
    process.exit(1);
  }

  for (const [i, row] of rows.entries()) {
    const cells = row.split('\t');
    const name = cells[nameIdx];
    const latitude = cells[latIdx] ? parseFloat(cells[latIdx]) : null;
    const longitude = cells[lngIdx] ? parseFloat(cells[lngIdx]) : null;
    if (!name || latitude === null || longitude === null) {
      console.warn(`Skipped row ${i + 2}: invalid or missing data`);
      continue;
    }
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
