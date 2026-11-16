import { describe, test, expect } from "vitest";
import { projectSchema, riskSchema, baselineEntrySchema } from "@/lib/validation";

describe("projectSchema", () => {
  test("rejects scenario D", () => {
    expect(projectSchema.safeParse({ name: "St. Mary", scenario: "D", kind: "hospital" }).success).toBe(false);
  });
  test("rejects an empty name", () => {
    expect(projectSchema.safeParse({ name: "  ", scenario: "A", kind: "hospital" }).success).toBe(false);
  });
  test("accepts scenario A with a name", () => {
    expect(projectSchema.safeParse({ name: "St. Mary", scenario: "A", kind: "hospital" }).success).toBe(true);
  });
});

describe("riskSchema", () => {
  test("rejects an unknown severity", () => {
    expect(riskSchema.safeParse({ title: "x", severity: "meh", status: "open" }).success).toBe(false);
  });
});

describe("baselineEntrySchema", () => {
  test("rejects negative amounts", () => {
    expect(baselineEntrySchema.safeParse({ month: "2027-01-01", baseline: -1, actual: 5 }).success).toBe(false);
  });
  test("rejects a non-date month", () => {
    expect(baselineEntrySchema.safeParse({ month: "soon", baseline: 1, actual: 5 }).success).toBe(false);
  });
});

import { loginSchema } from "@/lib/validation";

describe("loginSchema", () => {
  test("rejects a malformed email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });
  test("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
  test("accepts valid credentials and trims the email", () => {
    const r = loginSchema.safeParse({ email: " a@b.co ", password: "secret" });
    expect(r.success && r.data.email).toBe("a@b.co");
  });
});

import { dependencySchema } from "@/lib/validation";

describe("dependencySchema", () => {
  test("rejects an unknown type", () => {
    expect(dependencySchema.safeParse({ title: "x", type: "visa", due_date: "2027-01-01" }).success).toBe(false);
  });
  test("rejects a malformed due date", () => {
    expect(dependencySchema.safeParse({ title: "x", type: "dea", due_date: "tomorrow" }).success).toBe(false);
  });
  test("accepts a valid dependency", () => {
    expect(dependencySchema.safeParse({ title: "DEA", type: "dea", due_date: "2027-01-01" }).success).toBe(true);
  });
});
