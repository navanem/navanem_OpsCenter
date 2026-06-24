import { describe, it, expect } from "vitest";
import { buildTicketWhere } from "@/lib/tickets/where";

describe("buildTicketWhere", () => {
  it("is empty with no filters", () => {
    expect(buildTicketWhere({})).toEqual({});
  });
  it("filters by status, priority, client, assignee", () => {
    expect(buildTicketWhere({ status: "OPEN", priority: "HIGH", clientId: "c1", assigneeId: "u1" })).toEqual({
      status: "OPEN",
      priority: "HIGH",
      clientId: "c1",
      assigneeId: "u1",
    });
  });
  it("searches the subject case-insensitively", () => {
    expect(buildTicketWhere({ search: "printer" }).subject).toEqual({
      contains: "printer",
      mode: "insensitive",
    });
  });
});
