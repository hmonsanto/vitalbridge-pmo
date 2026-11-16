import { describe, test, expect } from "vitest";
import { groupByDay, is340bDay, monthGrid, monthKey, parseDay, parseMonth, shiftMonth } from "@/domain/calendar";

const today = new Date(Date.UTC(2026, 10, 16)); // 2026-11-16

describe("parseMonth", () => {
  test("reads a valid YYYY-MM", () => {
    expect(parseMonth("2027-01", today)).toEqual({ year: 2027, month: 1 });
  });
  test("falls back to the current month for missing or invalid input", () => {
    for (const bad of [undefined, "", "foo", "2027-13", "2027-00", "27-01"]) {
      expect(parseMonth(bad, today)).toEqual({ year: 2026, month: 11 });
    }
  });
});

describe("shiftMonth and monthKey", () => {
  test("rolls December forward into January of the next year", () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
  });
  test("rolls January back into December of the previous year", () => {
    expect(shiftMonth({ year: 2027, month: 1 }, -1)).toEqual({ year: 2026, month: 12 });
  });
  test("formats a key with a zero-padded month", () => {
    expect(monthKey({ year: 2027, month: 3 })).toBe("2027-03");
  });
});

describe("monthGrid", () => {
  test("November 2026 starting Monday takes six weeks and pads with the neighbouring months", () => {
    const weeks = monthGrid({ year: 2026, month: 11 }, 1);
    expect(weeks).toHaveLength(6);
    expect(weeks[0][0]).toEqual({ date: "2026-10-26", inMonth: false });
    expect(weeks[0][6]).toEqual({ date: "2026-11-01", inMonth: true });
    expect(weeks[5][6]).toEqual({ date: "2026-12-06", inMonth: false });
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });
  test("February 2027 fits exactly four weeks", () => {
    const weeks = monthGrid({ year: 2027, month: 2 }, 1);
    expect(weeks).toHaveLength(4);
    expect(weeks[0][0].date).toBe("2027-02-01");
    expect(weeks[3][6].date).toBe("2027-02-28");
  });
  test("can start the week on Sunday", () => {
    expect(monthGrid({ year: 2026, month: 11 }, 0)[0][0].date).toBe("2026-11-01");
  });
});

describe("is340bDay", () => {
  test("is true from the 1st to the 15th of January, April, July and October", () => {
    for (const d of ["2027-01-01", "2027-01-15", "2027-04-10", "2027-07-15", "2027-10-01"]) {
      expect(is340bDay(d), d).toBe(true);
    }
  });
  test("is false outside those windows", () => {
    for (const d of ["2027-01-16", "2027-02-10", "2026-12-31", "2027-04-16", "2027-11-05"]) {
      expect(is340bDay(d), d).toBe(false);
    }
  });
});

describe("parseDay", () => {
  test("accepts a real date", () => {
    expect(parseDay("2027-02-28")).toBe("2027-02-28");
  });
  test("rejects impossible or malformed dates", () => {
    for (const bad of [undefined, "2027-02-30", "2027-13-01", "tomorrow", "2027-2-3"]) {
      expect(parseDay(bad), String(bad)).toBeNull();
    }
  });
});

describe("groupByDay", () => {
  test("groups events under their date and keeps order", () => {
    const grouped = groupByDay([
      { date: "2027-01-05", id: "a" },
      { date: "2027-01-06", id: "b" },
      { date: "2027-01-05", id: "c" },
    ]);
    expect(Object.keys(grouped).sort()).toEqual(["2027-01-05", "2027-01-06"]);
    expect(grouped["2027-01-05"].map((e) => e.id)).toEqual(["a", "c"]);
  });
  test("returns an empty object for no events", () => {
    expect(groupByDay([])).toEqual({});
  });
});
