const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('export_activity_templates_tsv.js', () => {
  const scriptPath = path.resolve(__dirname, '../../bin/export_activity_templates_tsv.js');
  const outputPath = path.resolve(__dirname, '../../prisma/activity_templates_seed.tsv');

  beforeAll(() => {
    // 事前に出力ファイルを削除
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  });

  it('活動テンプレートTSV出力が成功する', () => {
    execSync(`node ${scriptPath}`);
    expect(fs.existsSync(outputPath)).toBe(true);
    const content = fs.readFileSync(outputPath, 'utf8');
    expect(content).toMatch(/^id\tname\tdescription\twhenType\twhen\tplaceId/);
    // 1行以上のデータが出力されていること
    const lines = content.trim().split('\n');
    expect(lines.length).toBeGreaterThan(1);
  });
});
