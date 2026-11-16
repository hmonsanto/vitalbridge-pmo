import { describe, test, expect } from "vitest";
import { rateLimit, resetRateLimits } from "@/lib/rate-limit";

describe("rateLimit", () => {
  test("allows 5 attempts then blocks the 6th", () => {
    resetRateLimits();
    for (let i = 0; i < 5; i++) expect(rateLimit("ip:email", 5, 60_000).allowed).toBe(true);
    const sixth = rateLimit("ip:email", 5, 60_000);
    expect(sixth.allowed).toBe(false);
    expect(sixth.retryAfterMs).toBeGreaterThan(0);
  });
  test("keys are independent", () => {
    resetRateLimits();
    for (let i = 0; i < 5; i++) rateLimit("a", 5, 60_000);
    expect(rateLimit("b", 5, 60_000).allowed).toBe(true);
  });
  test("allows again after the window passes", () => {
    resetRateLimits();
    for (let i = 0; i < 5; i++) rateLimit("a", 5, 60_000, 1_000);
    expect(rateLimit("a", 5, 60_000, 1_000 + 60_001).allowed).toBe(true);
  });
});
