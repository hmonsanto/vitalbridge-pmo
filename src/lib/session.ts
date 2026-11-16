import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Role = "owner" | "viewer";
export type Session = { userId: string; role: Role | null; aal: string | undefined };

/**
 * The signed-in user for this request, or null.
 *
 * Identity comes from the JWT (verified locally against the project's signing keys, no network call to
 * the Auth server). The role needs one database read. `cache` makes layouts, pages and actions in the
 * same request share a single result instead of each repeating both lookups.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", claims.sub).single();
  return {
    userId: claims.sub,
    role: (profile?.role as Role | undefined) ?? null,
    aal: typeof claims.aal === "string" ? claims.aal : undefined,
  };
});
