import { describe, it, expect } from "vitest";
import { can, type AuthUser } from "@/lib/rbac/can";
import { PERMISSION_KEYS } from "@/lib/rbac/permissions";

const user: AuthUser = {
  id: "u1",
  email: "a@b.c",
  permissions: ["clients.read", "clients.manage"],
};

describe("can", () => {
  it("returns false for a null user", () => {
    expect(can(null, "clients.read")).toBe(false);
  });

  it("returns true when the user has the permission", () => {
    expect(can(user, "clients.read")).toBe(true);
  });

  it("returns false when the user lacks the permission", () => {
    expect(can(user, "settings.manage")).toBe(false);
  });
});

describe("permission catalog", () => {
  it("exposes the expected keys", () => {
    expect(PERMISSION_KEYS).toContain("settings.manage");
    expect(PERMISSION_KEYS).toContain("tickets.read");
    expect(PERMISSION_KEYS).toContain("tickets.manage");
    expect(PERMISSION_KEYS).toContain("tickets.assign");
    expect(PERMISSION_KEYS).toContain("projects.read");
    expect(PERMISSION_KEYS).toContain("projects.manage");
    expect(PERMISSION_KEYS).toContain("projects.assign");
    expect(PERMISSION_KEYS).toContain("visits.read");
    expect(PERMISSION_KEYS).toContain("visits.manage");
    expect(PERMISSION_KEYS).toContain("visits.assign");
    expect(PERMISSION_KEYS).toContain("timesheets.read");
    expect(PERMISSION_KEYS).toContain("timesheets.read.all");
    expect(PERMISSION_KEYS).toContain("timesheets.approve");
    expect(PERMISSION_KEYS).toContain("contracts.read");
    expect(PERMISSION_KEYS).toContain("contracts.manage");
    expect(PERMISSION_KEYS).toContain("knowledge.read");
    expect(PERMISSION_KEYS).toContain("knowledge.manage");
    expect(PERMISSION_KEYS).toContain("devices.read");
    expect(PERMISSION_KEYS).toContain("devices.manage");
    expect(PERMISSION_KEYS).toContain("subscriptions.read");
    expect(PERMISSION_KEYS).toContain("subscriptions.manage");
    expect(PERMISSION_KEYS).toContain("audit.read");
    expect(PERMISSION_KEYS.length).toBe(29);
  });
});
