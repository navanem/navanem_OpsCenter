import { describe, it, expect } from "vitest";
import { isTicketOverdue } from "@/lib/tickets/meta";

const now = new Date("2026-07-10T12:00:00");

describe("isTicketOverdue", () => {
  it("is overdue when past due and still open", () => {
    expect(isTicketOverdue("2026-07-01T00:00:00", "OPEN", now)).toBe(true);
    expect(isTicketOverdue("2026-07-01T00:00:00", "IN_PROGRESS", now)).toBe(true);
  });
  it("is not overdue when due in the future", () => {
    expect(isTicketOverdue("2026-07-20T00:00:00", "OPEN", now)).toBe(false);
  });
  it("is not overdue for resolved or closed tickets", () => {
    expect(isTicketOverdue("2026-07-01T00:00:00", "RESOLVED", now)).toBe(false);
    expect(isTicketOverdue("2026-07-01T00:00:00", "CLOSED", now)).toBe(false);
  });
  it("is not overdue without a due date", () => {
    expect(isTicketOverdue(null, "OPEN", now)).toBe(false);
  });
});
