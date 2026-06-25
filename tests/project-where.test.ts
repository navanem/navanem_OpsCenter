import { describe, it, expect } from "vitest";
import { buildProjectWhere } from "@/lib/projects/where";

describe("buildProjectWhere", () => {
  it("is empty with no filters", () => { expect(buildProjectWhere({})).toEqual({}); });
  it("filters by status/client/lead", () => {
    expect(buildProjectWhere({ statusId: "s1", clientId: "c1", leadId: "u1" })).toEqual({ statusId: "s1", clientId: "c1", leadId: "u1" });
  });
  it("searches the name case-insensitively", () => {
    expect(buildProjectWhere({ search: "web" }).name).toEqual({ contains: "web", mode: "insensitive" });
  });
});
