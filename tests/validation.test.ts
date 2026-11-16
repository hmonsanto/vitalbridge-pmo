import { describe, test, expect } from "vitest";
import { projectSchema, riskSchema, baselineEntrySchema, deliverableSchema } from "@/lib/validation";

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

import { todoSchema, meetingSchema } from "@/lib/validation";

describe("todoSchema", () => {
  test("rejects an empty title", () => {
    expect(todoSchema.safeParse({ title: " " }).success).toBe(false);
  });
  test("accepts a title with an optional due date", () => {
    expect(todoSchema.safeParse({ title: "Call Ned", due_date: "2027-01-05" }).success).toBe(true);
  });
});

describe("meetingSchema", () => {
  test("rejects an invalid start time", () => {
    expect(meetingSchema.safeParse({ title: "Sync", starts_at: "later" }).success).toBe(false);
  });
  test("accepts an ISO start time", () => {
    expect(meetingSchema.safeParse({ title: "Sync", starts_at: "2027-01-05T10:00:00.000Z" }).success).toBe(true);
  });
});

describe("deliverableSchema doc_url", () => {
  const base = { name: "Doc", phase: 1, status: "not_started" as const };
  test("rejects a javascript: URL", () => {
    expect(deliverableSchema.safeParse({ ...base, doc_url: "javascript:alert(1)" }).success).toBe(false);
  });
  test("accepts an https URL", () => {
    expect(deliverableSchema.safeParse({ ...base, doc_url: "https://example.com/doc.docx" }).success).toBe(true);
  });
});

import { deliverableEditSchema, dependencyEditSchema } from "@/lib/validation";

describe("deliverableEditSchema", () => {
  const base = { name: "Doc", phase: 2 };
  test("accepts a deliverable with no link or remarks", () => {
    expect(deliverableEditSchema.safeParse(base).success).toBe(true);
  });
  test("accepts an https link and remarks", () => {
    expect(
      deliverableEditSchema.safeParse({ ...base, doc_url: "https://example.com/a.docx", remarks: "Signed off" }).success,
    ).toBe(true);
  });
  test("rejects a script link", () => {
    expect(deliverableEditSchema.safeParse({ ...base, doc_url: "javascript:alert(1)" }).success).toBe(false);
  });
  test("rejects a phase outside 1-6", () => {
    expect(deliverableEditSchema.safeParse({ ...base, phase: 7 }).success).toBe(false);
  });
});

describe("dependencyEditSchema", () => {
  const base = { title: "DEA", type: "dea", due_date: "2027-01-01" };
  test("requires a known status", () => {
    expect(dependencyEditSchema.safeParse({ ...base, status: "maybe" }).success).toBe(false);
    expect(dependencyEditSchema.safeParse({ ...base, status: "in_progress" }).success).toBe(true);
  });
});
