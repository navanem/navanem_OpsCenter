import { describe, it, expect } from "vitest";
import { ticketSchema, commentSchema } from "@/lib/validation/ticket";

const base = {
  subject: "Printer offline",
  description: "The 3rd floor printer is unreachable.",
  clientId: "c1",
  priority: "HIGH",
  category: "HARDWARE",
  assigneeId: "",
};

describe("ticketSchema", () => {
  it("accepts a valid ticket", () => {
    expect(ticketSchema.safeParse(base).success).toBe(true);
  });
  it("requires a subject", () => {
    expect(ticketSchema.safeParse({ ...base, subject: "" }).success).toBe(false);
  });
  it("requires a description", () => {
    expect(ticketSchema.safeParse({ ...base, description: "" }).success).toBe(false);
  });
  it("requires a client", () => {
    expect(ticketSchema.safeParse({ ...base, clientId: "" }).success).toBe(false);
  });
  it("rejects an invalid priority", () => {
    expect(ticketSchema.safeParse({ ...base, priority: "NOPE" }).success).toBe(false);
  });
});

describe("commentSchema", () => {
  it("requires a non-empty body", () => {
    expect(commentSchema.safeParse({ body: "" }).success).toBe(false);
    expect(commentSchema.safeParse({ body: "Looking into it." }).success).toBe(true);
  });
});
