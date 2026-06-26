import { describe, it, expect } from "vitest";
import { formatSubscriptionReference, isRenewalDueSoon, isRenewalOverdue } from "@/lib/subscriptions/meta";

describe("formatSubscriptionReference", () => {
  it("offsets the number by 1000 with a SUB- prefix", () => {
    expect(formatSubscriptionReference(1)).toBe("SUB-1001");
    expect(formatSubscriptionReference(234)).toBe("SUB-1234");
  });
});

describe("isRenewalDueSoon", () => {
  const now = new Date("2026-06-01T00:00:00Z");
  it("is true within the window and false outside", () => {
    expect(isRenewalDueSoon(new Date("2026-06-20T00:00:00Z"), now, 30)).toBe(true);
    expect(isRenewalDueSoon(new Date("2026-08-01T00:00:00Z"), now, 30)).toBe(false);
    expect(isRenewalDueSoon(new Date("2026-05-01T00:00:00Z"), now, 30)).toBe(false); // past
    expect(isRenewalDueSoon(null, now, 30)).toBe(false);
  });
});

describe("isRenewalOverdue", () => {
  const now = new Date("2026-06-01T00:00:00Z");
  it("is true only for past dates", () => {
    expect(isRenewalOverdue(new Date("2026-05-01T00:00:00Z"), now)).toBe(true);
    expect(isRenewalOverdue(new Date("2026-07-01T00:00:00Z"), now)).toBe(false);
    expect(isRenewalOverdue(null, now)).toBe(false);
  });
});
