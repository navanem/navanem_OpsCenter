import { describe, it, expect } from "vitest";
import { generateOccurrences } from "@/lib/planning/recurrence";

const d = (s: string) => new Date(s + "T00:00:00");

describe("generateOccurrences", () => {
  it("DAILY every 1 day, capped by horizon", () => {
    const out = generateOccurrences(
      { frequency: "DAILY", interval: 1, startDate: d("2026-07-01"), endDate: null, weekdays: [], timeHour: 9, timeMinute: 30 },
      d("2026-07-04"),
    );
    expect(out.length).toBe(4); // Jul 1,2,3,4
    expect(out[0].getHours()).toBe(9);
    expect(out[0].getMinutes()).toBe(30);
  });

  it("DAILY every 2 days", () => {
    const out = generateOccurrences(
      { frequency: "DAILY", interval: 2, startDate: d("2026-07-01"), endDate: d("2026-07-07"), weekdays: [], timeHour: 8, timeMinute: 0 },
      d("2026-12-31"),
    );
    expect(out.map((x) => x.getDate())).toEqual([1, 3, 5, 7]);
  });

  it("WEEKLY on Mon+Wed for 2 weeks", () => {
    // 2026-07-06 is a Monday
    const out = generateOccurrences(
      { frequency: "WEEKLY", interval: 1, startDate: d("2026-07-06"), endDate: d("2026-07-19"), weekdays: [1, 3], timeHour: 10, timeMinute: 0 },
      d("2026-12-31"),
    );
    expect(out.length).toBe(4); // Mon 6, Wed 8, Mon 13, Wed 15
    expect(out.every((x) => x.getDay() === 1 || x.getDay() === 3)).toBe(true);
  });

  it("MONTHLY on the 31st clamps to month length", () => {
    const out = generateOccurrences(
      { frequency: "MONTHLY", interval: 1, startDate: d("2026-01-31"), endDate: d("2026-03-31"), weekdays: [], timeHour: 9, timeMinute: 0 },
      d("2026-12-31"),
    );
    expect(out.map((x) => `${x.getMonth() + 1}-${x.getDate()}`)).toEqual(["1-31", "2-28", "3-31"]);
  });

  it("respects endDate before horizon", () => {
    const out = generateOccurrences(
      { frequency: "DAILY", interval: 1, startDate: d("2026-07-01"), endDate: d("2026-07-02"), weekdays: [], timeHour: 9, timeMinute: 0 },
      d("2026-12-31"),
    );
    expect(out.length).toBe(2);
  });
});
