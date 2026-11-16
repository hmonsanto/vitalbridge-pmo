import { describe, test, expect } from "vitest";
import { isOverdue } from "@/domain/dependencies";

const today = new Date(Date.UTC(2027, 0, 10));

describe("isOverdue", () => {
  test("is overdue when due before today and not done", () => {
    expect(isOverdue("2027-01-09", "in_progress", today)).toBe(true);
  });
  test("is not overdue on the due date itself", () => {
    expect(isOverdue("2027-01-10", "pending", today)).toBe(false);
  });
  test("is not overdue when due in the future", () => {
    expect(isOverdue("2027-02-01", "pending", today)).toBe(false);
  });
  test("is never overdue once done", () => {
    expect(isOverdue("2020-01-01", "done", today)).toBe(false);
  });
});
