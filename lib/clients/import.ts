import { parseCsv } from "@/lib/export/csv";

export interface ParsedClientRow {
  companyName: string;
  domain: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export interface ClientImportResult {
  valid: ParsedClientRow[];
  errors: { line: number; message: string }[];
}

function findCol(header: string[], name: string): number {
  return header.findIndex((h) => h.trim().toLowerCase() === name);
}

// Maps a clients CSV (header row + data rows) into validated rows.
// Required column: "company". Optional: "domain", "status" (ACTIVE/INACTIVE, default ACTIVE).
export function parseClientsCsv(text: string): ClientImportResult {
  const matrix = parseCsv(text);
  if (matrix.length === 0) {
    return { valid: [], errors: [{ line: 0, message: "The file is empty." }] };
  }

  const header = matrix[0];
  const companyCol = findCol(header, "company");
  if (companyCol === -1) {
    return { valid: [], errors: [{ line: 1, message: 'Missing required "Company" column in the header row.' }] };
  }
  const domainCol = findCol(header, "domain");
  const statusCol = findCol(header, "status");

  const valid: ParsedClientRow[] = [];
  const errors: { line: number; message: string }[] = [];

  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];
    const line = r + 1; // 1-based, accounting for the header row
    const companyName = (row[companyCol] ?? "").trim();
    if (!companyName) {
      errors.push({ line, message: "Company is required." });
      continue;
    }
    const domainRaw = domainCol === -1 ? "" : (row[domainCol] ?? "").trim();
    const statusRaw = statusCol === -1 ? "" : (row[statusCol] ?? "").trim().toUpperCase();
    let status: "ACTIVE" | "INACTIVE" = "ACTIVE";
    if (statusRaw) {
      if (statusRaw !== "ACTIVE" && statusRaw !== "INACTIVE") {
        errors.push({ line, message: `Invalid status "${row[statusCol]}" (expected ACTIVE or INACTIVE).` });
        continue;
      }
      status = statusRaw;
    }
    valid.push({ companyName, domain: domainRaw || null, status });
  }

  return { valid, errors };
}
