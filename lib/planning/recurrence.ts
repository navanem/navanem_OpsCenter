export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface RecurrenceRule {
  frequency: Frequency;
  interval: number;
  startDate: Date;
  endDate: Date | null;
  weekdays: number[]; // WEEKLY only; 0=Sun..6=Sat; empty → use startDate's weekday
  timeHour: number;
  timeMinute: number;
}

export function generateOccurrences(rule: RecurrenceRule, horizonEnd: Date, max = 366): Date[] {
  const occ: Date[] = [];
  const interval = Math.max(1, Math.floor(rule.interval));
  const last = rule.endDate && rule.endDate < horizonEnd ? rule.endDate : horizonEnd;

  const start = new Date(rule.startDate);
  start.setHours(0, 0, 0, 0);
  const lastDay = new Date(last);
  lastDay.setHours(23, 59, 59, 999);

  const at = (y: number, m: number, day: number): Date =>
    new Date(y, m, day, rule.timeHour, rule.timeMinute, 0, 0);

  if (rule.frequency === "DAILY") {
    const d = new Date(start);
    while (d <= lastDay && occ.length < max) {
      occ.push(at(d.getFullYear(), d.getMonth(), d.getDate()));
      d.setDate(d.getDate() + interval);
    }
  } else if (rule.frequency === "WEEKLY") {
    const days = (rule.weekdays.length ? [...rule.weekdays] : [start.getDay()]).sort((a, b) => a - b);
    const weekStart = new Date(start);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday of start's week
    const w = new Date(weekStart);
    while (w <= lastDay && occ.length < max) {
      for (const wd of days) {
        const day = new Date(w);
        day.setDate(day.getDate() + wd);
        if (day >= start && day <= lastDay && occ.length < max) {
          occ.push(at(day.getFullYear(), day.getMonth(), day.getDate()));
        }
      }
      w.setDate(w.getDate() + 7 * interval);
    }
    occ.sort((a, b) => a.getTime() - b.getTime());
  } else {
    // MONTHLY on the start day-of-month, clamped to month length
    const dom = start.getDate();
    let y = start.getFullYear();
    let m = start.getMonth();
    while (occ.length < max) {
      const monthLen = new Date(y, m + 1, 0).getDate();
      const day = Math.min(dom, monthLen);
      const occDate = at(y, m, day);
      const occMidnight = new Date(y, m, day);
      if (occMidnight > lastDay) break;
      if (occMidnight >= start) occ.push(occDate);
      m += interval;
      y += Math.floor(m / 12);
      m = ((m % 12) + 12) % 12;
    }
  }
  return occ;
}
