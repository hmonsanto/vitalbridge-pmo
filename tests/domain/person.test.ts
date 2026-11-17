import { describe, test, expect } from "vitest";
import { displayName, firstName, initials } from "@/domain/person";

describe("displayName", () => {
  test("uses the full name when there is one", () => {
    expect(displayName("  Henry Monsanto ", "h@x.com")).toBe("Henry Monsanto");
  });
  test("falls back to the part of the email before the @", () => {
    expect(displayName(null, "monsanto11@hotmail.com")).toBe("monsanto11");
    expect(displayName("   ", "ned@vitalbridge.com")).toBe("ned");
  });
  test("never returns an empty string", () => {
    expect(displayName(null, null)).toBe("there");
  });
});

describe("firstName", () => {
  test("is the first word of the name", () => {
    expect(firstName("Henry Monsanto")).toBe("Henry");
  });
  test("keeps a single word as it is, including an email fallback", () => {
    expect(firstName("monsanto11")).toBe("monsanto11");
  });
});

describe("initials", () => {
  test("takes the first letters of the first two words, uppercased", () => {
    expect(initials("henry monsanto")).toBe("HM");
    expect(initials("Ana María López")).toBe("AM");
  });
  test("uses one letter for a single word", () => {
    expect(initials("ned")).toBe("N");
  });
  test("returns a placeholder for nothing", () => {
    expect(initials("")).toBe("?");
  });
});
