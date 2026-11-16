import { createClient } from "@/lib/supabase/server";

export type Role = "owner" | "viewer";

/** Role of the signed-in user, or null when there is no valid session. */
export async function getSessionRole(): Promise<Role | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return (data?.role as Role | undefined) ?? null;
}
