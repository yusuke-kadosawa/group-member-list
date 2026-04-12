// tsv-parse.ts
// テキスト内の改行を含むTSVを1レコードずつ正しくパースする関数

// 1レコードを「id\t」で始まる行から次のid行までを1レコードとみなしてパース
export function parseTsvWithMultiline(input: string): string[][] {
  const lines = input.split(/\r?\n/);
  const rows: string[][] = [];
  let buffer: string[] = [];
  let headerParsed = false;
  let headerCols: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!headerParsed) {
      headerCols = line.split('\t');
      rows.push(headerCols);
      headerParsed = true;
      continue;
    }
    // idで始まる新レコード
    if (/^\d+\t/.test(line)) {
      if (buffer.length > 0) {
        // 1レコード完成
        rows.push(parseTsvRow(buffer.join('\n'), headerCols.length));
      }
      buffer = [line];
    } else {
      buffer.push(line);
    }
  }
  if (buffer.length > 0) {
    rows.push(parseTsvRow(buffer.join('\n'), headerCols.length));
  }
  return rows;
}

// 1レコード分のテキストをカラム数に分割
function parseTsvRow(rowText: string, colCount: number): string[] {
  const cells: string[] = [];
  let cur = '';
  let col = 0;
  for (let i = 0; i < rowText.length; i++) {
    const char = rowText[i];
    if (char === '\t' && col < colCount - 1) {
      cells.push(cur);
      cur = '';
      col++;
    } else {
      cur += char;
    }
  }
  cells.push(cur);
  // カラム数が足りない場合は空文字で埋める
  while (cells.length < colCount) cells.push('');
  return cells;
}
