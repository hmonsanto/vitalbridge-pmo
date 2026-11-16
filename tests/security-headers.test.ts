import { describe, test, expect } from "vitest";
import { buildSecurityHeaders } from "@/lib/security-headers";

const h = (isDev = false) =>
  Object.fromEntries(buildSecurityHeaders("https://abc.supabase.co", isDev).map((x) => [x.key, x.value]));

describe("buildSecurityHeaders", () => {
  test("denies framing", () => {
    expect(h()["X-Frame-Options"]).toBe("DENY");
    expect(h()["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
  });
  test("restricts default sources and allows the supabase origin for connections", () => {
    const csp = h()["Content-Security-Policy"];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self' https://abc.supabase.co");
  });
  test("sets HSTS, referrer policy and permissions policy", () => {
    expect(h()["Strict-Transport-Security"]).toContain("max-age=");
    expect(h()["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(h()["Permissions-Policy"]).toContain("camera=()");
  });
  test("allows eval only in development", () => {
    expect(h(false)["Content-Security-Policy"]).not.toContain("'unsafe-eval'");
    expect(h(true)["Content-Security-Policy"]).toContain("'unsafe-eval'");
  });
});
