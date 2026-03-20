const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const tsvPath = path.join(__dirname, 'places_seed.tsv');

(async () => {
  try {
    const places = await prisma.place.findMany();
    if (!places.length) {
      console.log('No places found.');
      process.exit(0);
    }
    const lines = places.map(p => `${p.id}\t${p.name}\t${p.latitude}\t${p.longitude}`).join('\n') + '\n';
    fs.appendFileSync(tsvPath, lines, 'utf8');
    console.log('Appended', places.length, 'places to places_seed.tsv');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
