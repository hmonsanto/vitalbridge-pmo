import { getSession, type Role } from "@/lib/session";

export type { Role };

/** Role of the signed-in user, or null when there is no valid session. */
export async function getSessionRole(): Promise<Role | null> {
  return (await getSession())?.role ?? null;
}
