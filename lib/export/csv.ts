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

// Parse RFC 4180 CSV text into a matrix of strings. Handles quoted fields
// (with embedded commas, newlines and "" escapes), CRLF/LF, and a leading BOM.
// Fully blank lines are skipped.
export function parseCsv(text: string): string[][] {
  const input = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    // Skip rows that are entirely empty.
    if (!(row.length === 1 && row[0] === "")) rows.push(row);
    row = [];
  };

  while (i < input.length) {
    const c = input[i];
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += c;
        i++;
      }
    } else if (c === '"') {
      inQuotes = true;
      i++;
    } else if (c === ",") {
      pushField();
      i++;
    } else if (c === "\r") {
      i++; // handled by the following \n (or treated as line break below)
      if (input[i] === "\n") i++;
      pushRow();
    } else if (c === "\n") {
      i++;
      pushRow();
    } else {
      field += c;
      i++;
    }
  }
  // Flush the trailing field/row if the file did not end with a newline.
  if (field !== "" || row.length > 0) pushRow();
  return rows;
}
