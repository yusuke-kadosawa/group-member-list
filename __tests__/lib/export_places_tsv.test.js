const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('export_places_tsv.js', () => {
  const scriptPath = path.resolve(__dirname, '../../bin/export_places_tsv.js');
  const outputPath = path.resolve(__dirname, '../../prisma/places_seed.tsv');

  beforeAll(() => {
    // 事前に出力ファイルを削除
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  });

  it('場所データのTSV出力が成功する', () => {
    execSync(`node ${scriptPath}`);
    expect(fs.existsSync(outputPath)).toBe(true);
    const content = fs.readFileSync(outputPath, 'utf8');
    expect(content).toMatch(/^id\tname\tlatitude\tlongitude/);
    // 1行以上のデータが出力されていること
    const lines = content.trim().split('\n');
    expect(lines.length).toBeGreaterThan(1);
  });
});
