/** RFC 4180 CSV parsing with line numbers (1-based line where each record starts). */
export function parseCsvLines(text: string): { line: number; cells: string[] }[] {
  const s = text.replace(/^﻿/, "");
  const out: { line: number; cells: string[] }[] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let line = 1;
  let rowStart = 1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') { cell += '"'; i++; } else inQuotes = false;
      } else {
        if (ch === "\n") line++;
        cell += ch;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && s[i + 1] === "\n") i++;
      row.push(cell);
      if (row.length > 1 || row[0] !== "") out.push({ line: rowStart, cells: row });
      row = []; cell = ""; line++; rowStart = line;
    } else cell += ch;
  }
  row.push(cell);
  if (row.length > 1 || row[0] !== "") out.push({ line: rowStart, cells: row });
  return out;
}

export function parseCsv(text: string): string[][] {
  return parseCsvLines(text).map((r) => r.cells);
}

/** CSV with UTF-8 BOM so Excel shows Bangla correctly. */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + rows.map((r) => r.map(esc).join(",")).join("\r\n") + "\r\n";
}

export function csvResponse(filename: string, rows: (string | number | null | undefined)[][]) {
  return new Response(toCsv(rows), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${filename}"` },
  });
}
