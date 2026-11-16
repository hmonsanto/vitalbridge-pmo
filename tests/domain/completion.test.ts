import { describe, test, expect } from "vitest";
import { completionRate } from "@/domain/completion";

describe("completionRate", () => {
  test("is the rounded percentage of completed deliverables", () => {
    expect(completionRate(["completed", "completed", "in_progress", "not_started"])).toBe(50);
  });
  test("rounds to the nearest whole percent", () => {
    expect(completionRate(["completed", "in_progress", "in_progress"])).toBe(33);
  });
  test("is 0 for no deliverables instead of NaN", () => {
    expect(completionRate([])).toBe(0);
  });
  test("is 100 when everything is completed", () => {
    expect(completionRate(["completed", "completed"])).toBe(100);
  });
});
