#!/usr/bin/env node
// group-member-list/bin/export_activity_templates_tsv.js
// Prisma経由で活動テンプレートデータをTSV出力するスクリプト

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.activityTemplate.findMany({ orderBy: { id: 'asc' } });
  const tsvLines = [
    'id\tname\tdescription\twhenType\twhen\tplaceId',
    ...templates.map(t => [
      t.id,
      t.name,
      t.description ?? '',
      t.whenType,
      t.when,
      t.placeId ?? ''
    ].join('\t'))
  ];
  const outPath = path.resolve(__dirname, '../prisma/activity_templates_seed.tsv');
  fs.writeFileSync(outPath, tsvLines.join('\n'), 'utf8');
  console.log(`Exported ${templates.length} activity templates to ${outPath}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
