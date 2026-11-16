import { describe, test, expect } from "vitest";
import { canAdvance } from "@/domain/gates";

describe("canAdvance", () => {
  test("allows go and go_with_conditions", () => {
    expect(canAdvance(2, "go")).toBe(true);
    expect(canAdvance(2, "go_with_conditions")).toBe(true);
  });
  test("blocks stop and replan", () => {
    expect(canAdvance(2, "stop")).toBe(false);
    expect(canAdvance(2, "replan")).toBe(false);
  });
  test("blocks when no decision exists", () => {
    expect(canAdvance(2, null)).toBe(false);
  });
  test("never advances past the last phase", () => {
    expect(canAdvance(6, "go")).toBe(false);
  });
});
