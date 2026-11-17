import { describe, test, expect } from "vitest";
import { canEdit, isAdmin, needsMfa, parseRole, roleLabel } from "@/domain/roles";

describe("canEdit", () => {
  test("admins and editors can edit", () => {
    expect(canEdit("owner")).toBe(true);
    expect(canEdit("editor")).toBe(true);
  });
  test("viewers and unknown roles cannot", () => {
    expect(canEdit("viewer")).toBe(false);
    expect(canEdit(null)).toBe(false);
    expect(canEdit(undefined)).toBe(false);
  });
});

describe("isAdmin", () => {
  test("only the owner role is an admin", () => {
    expect(isAdmin("owner")).toBe(true);
    expect(isAdmin("editor")).toBe(false);
    expect(isAdmin("viewer")).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});

describe("needsMfa", () => {
  test("anyone who can change data must use two-step verification", () => {
    expect(needsMfa("owner")).toBe(true);
    expect(needsMfa("editor")).toBe(true);
  });
  test("viewers do not have to", () => {
    expect(needsMfa("viewer")).toBe(false);
    expect(needsMfa(null)).toBe(false);
  });
});

describe("roleLabel", () => {
  test("shows the owner role as Admin", () => {
    expect(roleLabel("owner")).toBe("Admin");
    expect(roleLabel("editor")).toBe("Editor");
    expect(roleLabel("viewer")).toBe("Viewer");
  });
});

describe("parseRole", () => {
  test("accepts the three roles", () => {
    expect(parseRole("owner")).toBe("owner");
    expect(parseRole("editor")).toBe("editor");
    expect(parseRole("viewer")).toBe("viewer");
  });
  test("rejects anything else", () => {
    expect(parseRole("god")).toBeNull();
    expect(parseRole("")).toBeNull();
    expect(parseRole(undefined)).toBeNull();
    expect(parseRole(7)).toBeNull();
  });
});
