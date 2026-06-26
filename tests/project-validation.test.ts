import { describe, it, expect } from "vitest";
import { projectSchema, taskSchema } from "@/lib/validation/project";

const project = { name: "Website revamp", description: "", clientId: "", statusId: "ps1", leadId: "", startDate: "", dueDate: "" };
const task = { projectId: "p1", title: "Design", description: "", statusId: "ts1", assigneeId: "", priority: "HIGH", startDate: "", dueDate: "" };

describe("projectSchema", () => {
  it("accepts a valid project", () => { expect(projectSchema.safeParse(project).success).toBe(true); });
  it("requires a name", () => { expect(projectSchema.safeParse({ ...project, name: "" }).success).toBe(false); });
  it("requires a status", () => { expect(projectSchema.safeParse({ ...project, statusId: "" }).success).toBe(false); });
});

describe("taskSchema", () => {
  it("accepts a valid task", () => { expect(taskSchema.safeParse(task).success).toBe(true); });
  it("requires a title", () => { expect(taskSchema.safeParse({ ...task, title: "" }).success).toBe(false); });
  it("requires a status", () => { expect(taskSchema.safeParse({ ...task, statusId: "" }).success).toBe(false); });
  it("rejects a bad priority", () => { expect(taskSchema.safeParse({ ...task, priority: "NOPE" }).success).toBe(false); });
});
