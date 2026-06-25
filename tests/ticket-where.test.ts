import { describe, it, expect } from "vitest";
import { buildTicketWhere } from "@/lib/tickets/where";

describe("buildTicketWhere", () => {
  it("is empty with no filters", () => {
    expect(buildTicketWhere({})).toEqual({});
  });
  it("filters by status, priorityId, categoryId, clientId, assigneeId", () => {
    expect(
      buildTicketWhere({
        status: "OPEN",
        priorityId: "tpri_high",
        categoryId: "tcat_hardware",
        clientId: "c1",
        assigneeId: "u1",
      })
    ).toEqual({
      status: "OPEN",
      priorityId: "tpri_high",
      categoryId: "tcat_hardware",
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
