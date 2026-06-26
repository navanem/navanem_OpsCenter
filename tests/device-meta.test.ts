import { describe, it, expect } from "vitest";
import { formatDeviceReference, isWarrantyExpiringSoon, isWarrantyExpired } from "@/lib/devices/meta";

const now = new Date("2026-07-10T12:00:00");

describe("formatDeviceReference", () => {
  it("formats DEV-####", () => {
    expect(formatDeviceReference(7)).toBe("DEV-1007");
  });
});

describe("isWarrantyExpiringSoon", () => {
  it("is true within the horizon", () => {
    expect(isWarrantyExpiringSoon("2026-08-01", now, 60)).toBe(true);
  });
  it("is false beyond the horizon", () => {
    expect(isWarrantyExpiringSoon("2026-12-01", now, 60)).toBe(false);
  });
  it("is false when already expired", () => {
    expect(isWarrantyExpiringSoon("2026-07-01", now, 60)).toBe(false);
  });
  it("is false without a date", () => {
    expect(isWarrantyExpiringSoon(null, now)).toBe(false);
  });
});

describe("isWarrantyExpired", () => {
  it("is true in the past", () => {
    expect(isWarrantyExpired("2026-07-01", now)).toBe(true);
  });
  it("is false in the future", () => {
    expect(isWarrantyExpired("2026-08-01", now)).toBe(false);
  });
});
