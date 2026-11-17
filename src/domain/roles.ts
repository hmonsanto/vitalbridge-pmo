/**
 * Who may do what.
 *
 *   owner   shown as "Admin": everything, plus managing people
 *   editor  creates and edits project data
 *   viewer  reads only
 *
 * The database enforces the same rules (row-level security); these helpers decide what the screens show and
 * what the server actions allow before a request even reaches it.
 */
export type Role = "owner" | "editor" | "viewer";

export const ROLES: readonly Role[] = ["owner", "editor", "viewer"];

const LABELS: Record<Role, string> = { owner: "Admin", editor: "Editor", viewer: "Viewer" };

export const canEdit = (role: Role | null | undefined): boolean => role === "owner" || role === "editor";

export const isAdmin = (role: Role | null | undefined): boolean => role === "owner";

/** Everyone who can change data must also use two-step verification. */
export const needsMfa = (role: Role | null | undefined): boolean => canEdit(role);

export const roleLabel = (role: Role): string => LABELS[role];

export function parseRole(value: unknown): Role | null {
  return ROLES.find((r) => r === value) ?? null;
}
