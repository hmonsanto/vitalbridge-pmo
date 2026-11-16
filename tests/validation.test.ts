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
