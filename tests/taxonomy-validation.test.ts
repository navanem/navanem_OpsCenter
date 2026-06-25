import { describe, it, expect } from "vitest";
import { taxonomyWithColorSchema, industrySchema } from "@/lib/validation/taxonomy";

describe("taxonomyWithColorSchema", () => {
  const base = { name: "Hardware", color: "#3b82f6", sortOrder: "1", isActive: "true" };
  it("accepts a valid entry", () => {
    expect(taxonomyWithColorSchema.safeParse(base).success).toBe(true);
  });
  it("requires a name", () => {
    expect(taxonomyWithColorSchema.safeParse({ ...base, name: "" }).success).toBe(false);
  });
  it("rejects a non-hex color", () => {
    expect(taxonomyWithColorSchema.safeParse({ ...base, color: "blue" }).success).toBe(false);
  });
});

describe("industrySchema", () => {
  it("requires a name", () => {
    expect(industrySchema.safeParse({ name: "", sortOrder: "0" }).success).toBe(false);
    expect(industrySchema.safeParse({ name: "Technology", sortOrder: "0" }).success).toBe(true);
  });
});
