import { describe, it, expect } from "vitest";
import { ticketSchema, commentSchema } from "@/lib/validation/ticket";

const base = {
  subject: "Printer offline",
  description: "The 3rd floor printer is unreachable.",
  clientId: "c1",
  categoryId: "tcat_hardware",
  priorityId: "tpri_high",
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
  it("requires a categoryId", () => {
    expect(ticketSchema.safeParse({ ...base, categoryId: "" }).success).toBe(false);
  });
  it("requires a priorityId", () => {
    expect(ticketSchema.safeParse({ ...base, priorityId: "" }).success).toBe(false);
  });
});

describe("commentSchema", () => {
  it("requires a non-empty body", () => {
    expect(commentSchema.safeParse({ body: "" }).success).toBe(false);
    expect(commentSchema.safeParse({ body: "Looking into it." }).success).toBe(true);
  });
});
