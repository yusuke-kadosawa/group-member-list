#!/usr/bin/env node
// group-member-list/bin/export_places_tsv.js
// Prisma経由で場所データをTSV出力するスクリプト

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const places = await prisma.place.findMany({ orderBy: { id: 'asc' } });
  const tsvLines = [
    'id\tname\tlatitude\tlongitude',
    ...places.map(p => [p.id, p.name, p.latitude ?? '', p.longitude ?? ''].join('\t'))
  ];
  const outPath = path.resolve(__dirname, '../prisma/places_seed.tsv');
  fs.writeFileSync(outPath, tsvLines.join('\n'), 'utf8');
  console.log(`Exported ${places.length} places to ${outPath}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
