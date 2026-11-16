import { describe, test, expect } from "vitest";
import { calcFee } from "@/domain/fee";

describe("calcFee", () => {
  test("charges 30% of incremental gross profit over baseline", () => {
    expect(calcFee([{ baseline: 100, actual: 140 }])).toEqual({ incremental: 40, fee: 12 });
  });
  test("owes nothing when actual is below baseline", () => {
    expect(calcFee([{ baseline: 100, actual: 80 }])).toEqual({ incremental: 0, fee: 0 });
  });
  test("returns zeros for no entries", () => {
    expect(calcFee([])).toEqual({ incremental: 0, fee: 0 });
  });
  test("does not net a bad month against a good month", () => {
    expect(
      calcFee([
        { baseline: 100, actual: 140 },
        { baseline: 100, actual: 60 },
      ]),
    ).toEqual({ incremental: 40, fee: 12 });
  });
  test("rounds the fee to cents", () => {
    expect(calcFee([{ baseline: 0, actual: 0.05 }]).fee).toBe(0.02);
  });
});
