import { describe, test, expect } from "vitest";
import { next340bWindow } from "@/domain/windows340b";

const d = (y: number, m: number, day: number) => new Date(Date.UTC(y, m - 1, day));
const iso = (x: Date) => x.toISOString().slice(0, 10);

describe("next340bWindow", () => {
  test("is open on the 1st of a window month", () => {
    const w = next340bWindow(d(2027, 1, 1));
    expect(w.isOpen).toBe(true);
    expect(iso(w.start)).toBe("2027-01-01");
    expect(iso(w.end)).toBe("2027-01-15");
  });
  test("is still open on the 15th", () => {
    expect(next340bWindow(d(2027, 1, 15)).isOpen).toBe(true);
  });
  test("is closed on the 16th and points to April 1", () => {
    const w = next340bWindow(d(2027, 1, 16));
    expect(w.isOpen).toBe(false);
    expect(iso(w.start)).toBe("2027-04-01");
  });
  test("rolls Dec 31 to January 1 of the next year", () => {
    const w = next340bWindow(d(2026, 12, 31));
    expect(w.isOpen).toBe(false);
    expect(iso(w.start)).toBe("2027-01-01");
  });
  test("between windows points to the next quarter month", () => {
    expect(iso(next340bWindow(d(2027, 5, 20)).start)).toBe("2027-07-01");
  });
});
