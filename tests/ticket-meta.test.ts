import { describe, it, expect } from "vitest";
import {
  TICKET_STATUSES,
  formatTicketReference,
} from "@/lib/tickets/meta";

describe("ticket meta", () => {
  it("has the five statuses", () => {
    expect(TICKET_STATUSES).toEqual(["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"]);
  });

  it("formats a reference from the ticket number", () => {
    expect(formatTicketReference(1)).toBe("TKT-1001");
    expect(formatTicketReference(42)).toBe("TKT-1042");
  });
});
