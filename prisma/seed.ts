
// prisma/seed.ts
// TSVファイルからPlaceテーブルにデータをインポートするスクリプト

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { parseTsvWithMultiline } from './tsv-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env（CIのDATABASE_URL）を優先して読み込む
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  // Placeシード（従来通り）
  const placesTsvPath = path.resolve(__dirname, 'places_seed.tsv');
  if (fs.existsSync(placesTsvPath)) {
    const lines = fs.readFileSync(placesTsvPath, 'utf8').split(/\r?\n/).filter(Boolean);
    const [header, ...rows] = lines;
    const columns = header.split('\t');
    const nameIdx = columns.indexOf('name');
    const latIdx = columns.indexOf('latitude');
    const lngIdx = columns.indexOf('longitude');

    if (nameIdx === -1 || latIdx === -1 || lngIdx === -1) {
      console.error('places_seed.tsv header must include name, latitude, longitude');
      process.exit(1);
    }

    for (const [i, row] of rows.entries()) {
      const cells = row.split('\t');
      const name = cells[nameIdx];
      const latitude = cells[latIdx] ? parseFloat(cells[latIdx]) : null;
      const longitude = cells[lngIdx] ? parseFloat(cells[lngIdx]) : null;
      if (!name || latitude === null || longitude === null) {
        console.warn(`[Place] Skipped row ${i + 2}: invalid or missing data`);
        continue;
      }
      await prisma.place.upsert({
        where: { name },
        update: { latitude, longitude },
        create: { name, latitude, longitude },
      });
      console.log(`[Place] Upserted: ${name}`);
    }
  } else {
    console.warn('places_seed.tsv not found, skipping Place seeding');
  }

  // ActivityTemplateシード（テキスト内改行対応）
  const actTmplTsvPath = path.resolve(__dirname, 'activity_templates_seed.tsv');
  if (fs.existsSync(actTmplTsvPath)) {
    const tsvRaw = fs.readFileSync(actTmplTsvPath, 'utf8');
    const rows = parseTsvWithMultiline(tsvRaw);
    if (rows.length < 2) {
      console.warn('activity_templates_seed.tsv has no data rows');
    } else {
      const columns = rows[0];
      const nameIdx = columns.indexOf('name');
      const descIdx = columns.indexOf('description');
      const whenTypeIdx = columns.indexOf('whenType');
      const whenIdx = columns.indexOf('when');
      const placeIdIdx = columns.indexOf('placeId');

      if (nameIdx === -1 || whenTypeIdx === -1) {
        console.error('activity_templates_seed.tsv header must include at least name, whenType');
        process.exit(1);
      }

      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i];
        const name = cells[nameIdx];
        const description = descIdx !== -1 ? cells[descIdx] : undefined;
        const whenType = cells[whenTypeIdx] ? parseInt(cells[whenTypeIdx]) : null;
        const when = whenIdx !== -1 ? cells[whenIdx] : undefined;
        const placeId = placeIdIdx !== -1 && cells[placeIdIdx] ? parseInt(cells[placeIdIdx]) : undefined;
        if (!name || whenType === null) {
          console.warn(`[ActivityTemplate] Skipped row ${i + 1}: invalid or missing data`);
          continue;
        }
        await prisma.activityTemplate.upsert({
          where: { id: i }, // idでupsert（既存データがなければcreate）
          update: { name, description, whenType, when, placeId },
          create: { name, description, whenType, when, placeId },
        });
        console.log(`[ActivityTemplate] Upserted: ${name}`);
      }
    }
  } else {
    console.warn('activity_templates_seed.tsv not found, skipping ActivityTemplate seeding');
  }
  console.log('Seed complete.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
