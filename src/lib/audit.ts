import { createClient } from "@/lib/supabase/server";

/** Appends an audit entry for the signed-in user. Never throws: auditing must not block the action itself. */
export async function recordAudit(action: string, table?: string, rowId?: string): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("audit_log").insert({
      actor: user.id,
      action,
      table_name: table ?? null,
      row_id: rowId ?? null,
    });
  } catch {
    // Intentionally swallowed.
  }
}
