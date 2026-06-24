import { describe, it, expect } from "vitest";
import { wouldLockOutLastAdmin } from "@/lib/users/admin-guard";

describe("wouldLockOutLastAdmin", () => {
  it("is false when the target is not an active admin", () => {
    expect(wouldLockOutLastAdmin({ targetIsActiveAdmin: false, activeAdminCount: 1 })).toBe(false);
  });
  it("is true when removing the last active admin", () => {
    expect(wouldLockOutLastAdmin({ targetIsActiveAdmin: true, activeAdminCount: 1 })).toBe(true);
  });
  it("is false when other active admins remain", () => {
    expect(wouldLockOutLastAdmin({ targetIsActiveAdmin: true, activeAdminCount: 2 })).toBe(false);
  });
});
