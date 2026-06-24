import { describe, it, expect } from "vitest";
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES,
  formatTicketReference,
} from "@/lib/tickets/meta";

describe("ticket meta", () => {
  it("has the five statuses, four priorities, five categories", () => {
    expect(TICKET_STATUSES).toEqual(["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"]);
    expect(TICKET_PRIORITIES).toEqual(["LOW", "MEDIUM", "HIGH", "URGENT"]);
    expect(TICKET_CATEGORIES.length).toBe(5);
  });

  it("formats a reference from the ticket number", () => {
    expect(formatTicketReference(1)).toBe("TKT-1001");
    expect(formatTicketReference(42)).toBe("TKT-1042");
  });
});
