import { describe, it, expect } from "vitest";
import { toCsv, parseCsv } from "@/lib/export/csv";

const BOM = "﻿";

describe("toCsv", () => {
  it("joins headers and rows with CRLF and a BOM", () => {
    const csv = toCsv(["a", "b"], [["1", "2"], ["3", "4"]]);
    expect(csv).toBe(`${BOM}a,b\r\n1,2\r\n3,4`);
  });

  it("quotes cells containing commas, quotes or newlines", () => {
    const csv = toCsv(["x"], [["a,b"], ['he said "hi"'], ["line1\nline2"]]);
    expect(csv).toBe(`${BOM}x\r\n"a,b"\r\n"he said ""hi"""\r\n"line1\nline2"`);
  });

  it("renders null/undefined as empty and coerces numbers/booleans", () => {
    const csv = toCsv(["a", "b", "c", "d"], [[null, undefined, 42, true]]);
    expect(csv).toBe(`${BOM}a,b,c,d\r\n,,42,true`);
  });
});

describe("parseCsv", () => {
  it("parses simple rows and strips a BOM", () => {
    expect(parseCsv(`${BOM}a,b\r\n1,2\r\n3,4`)).toEqual([["a", "b"], ["1", "2"], ["3", "4"]]);
  });

  it("handles quoted fields with commas, quotes and newlines", () => {
    const text = `x\r\n"a,b"\r\n"he said ""hi"""\r\n"line1\nline2"`;
    expect(parseCsv(text)).toEqual([["x"], ["a,b"], ['he said "hi"'], ["line1\nline2"]]);
  });

  it("accepts LF-only line endings and skips blank lines", () => {
    expect(parseCsv("a,b\n1,2\n\n3,4\n")).toEqual([["a", "b"], ["1", "2"], ["3", "4"]]);
  });

  it("round-trips toCsv output", () => {
    const csv = toCsv(["Name", "Note"], [["Acme, Inc", 'say "hi"'], ["Beta", "x"]]);
    expect(parseCsv(csv)).toEqual([["Name", "Note"], ["Acme, Inc", 'say "hi"'], ["Beta", "x"]]);
  });
});
