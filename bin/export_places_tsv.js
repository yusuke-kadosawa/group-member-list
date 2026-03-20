#!/usr/bin/env node
// group-member-list/bin/export_places_tsv.js
// Prisma経由で場所データをTSV出力するスクリプト

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

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
