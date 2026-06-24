import { describe, it, expect } from "vitest";
import { buildClientWhere } from "@/lib/clients/where";

describe("buildClientWhere", () => {
  it("returns an empty filter when nothing is provided", () => {
    expect(buildClientWhere({})).toEqual({});
  });

  it("filters by status", () => {
    expect(buildClientWhere({ status: "INACTIVE" })).toEqual({ status: "INACTIVE" });
  });

  it("filters by technician", () => {
    expect(buildClientWhere({ technicianId: "u1" })).toEqual({
      assignedTechnicianId: "u1",
    });
  });

  it("builds a case-insensitive OR search across key fields", () => {
    const where = buildClientWhere({ search: "acme" });
    expect(where.OR).toEqual([
      { companyName: { contains: "acme", mode: "insensitive" } },
      { domain: { contains: "acme", mode: "insensitive" } },
      { contactName: { contains: "acme", mode: "insensitive" } },
      { contactEmail: { contains: "acme", mode: "insensitive" } },
    ]);
  });
});
