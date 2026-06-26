// Minimal RFC 4180 CSV serializer. Values are coerced to strings; null/undefined become "".
export type CsvCell = string | number | boolean | null | undefined;

function escapeCell(value: CsvCell): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(headers: string[], rows: CsvCell[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  // CRLF line endings + a leading BOM so Excel opens UTF-8 correctly.
  return "﻿" + lines.join("\r\n");
}
