import { describe, test, expect } from "vitest";
import { formatRecoveryCode, normalizeRecoveryCode } from "@/domain/recovery";

describe("normalizeRecoveryCode", () => {
  test("accepts the displayed form", () => {
    expect(normalizeRecoveryCode("ABCD-EF01-2345")).toBe("ABCDEF012345");
  });
  test("is forgiving about case, dashes and spaces", () => {
    expect(normalizeRecoveryCode("  abcd ef01 2345 ")).toBe("ABCDEF012345");
    expect(normalizeRecoveryCode("abcdef012345")).toBe("ABCDEF012345");
  });
  test("rejects the wrong length", () => {
    expect(normalizeRecoveryCode("ABCD-EF01")).toBeNull();
    expect(normalizeRecoveryCode("ABCD-EF01-2345-6789")).toBeNull();
  });
  test("rejects characters that are not hexadecimal", () => {
    expect(normalizeRecoveryCode("ABCD-EF01-234G")).toBeNull();
  });
  test("rejects empty input", () => {
    expect(normalizeRecoveryCode("")).toBeNull();
  });
});

describe("formatRecoveryCode", () => {
  test("groups 12 characters in blocks of four", () => {
    expect(formatRecoveryCode("ABCDEF012345")).toBe("ABCD-EF01-2345");
  });
});
