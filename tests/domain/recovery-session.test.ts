import { describe, test, expect } from "vitest";
import { isRecoverySession } from "@/lib/recovery-session";

describe("isRecoverySession", () => {
  test("is true when the session came from an emailed one-time link", () => {
    expect(isRecoverySession({ amr: [{ method: "otp", timestamp: 1 }] })).toBe(true);
    expect(isRecoverySession({ amr: [{ method: "totp", timestamp: 2 }, { method: "recovery", timestamp: 1 }] })).toBe(true);
  });
  test("is false for an ordinary password sign-in, with or without a second factor", () => {
    expect(isRecoverySession({ amr: [{ method: "password", timestamp: 1 }] })).toBe(false);
    expect(isRecoverySession({ amr: [{ method: "password", timestamp: 1 }, { method: "totp", timestamp: 2 }] })).toBe(false);
  });
  test("is false when the claim is missing or malformed", () => {
    expect(isRecoverySession({})).toBe(false);
    expect(isRecoverySession({ amr: "otp" })).toBe(false);
    expect(isRecoverySession(null)).toBe(false);
  });
});
