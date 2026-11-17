"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { isAdmin, parseRole } from "@/domain/roles";
import { displayNameSchema } from "@/lib/validation";
import type { FormState } from "@/app/(app)/hospitals/actions";

// Every action here only calls database functions that check, again, that the caller is an administrator and
// write the change to the audit log. The check below just fails fast with a clear message.
const idSchema = z.guid();
const NOT_ALLOWED: FormState = { error: "Only administrators can do this" };

function explain(error: { code?: string; message?: string } | null): FormState {
  if (!error) return { ok: true };
  if (error.code === "42501") return NOT_ALLOWED;
  // 22023 is the database's "invalid request" code; its messages are written to be shown to people.
  if (error.code === "22023" && error.message) return { error: error.message };
  return { error: "Could not save the change. Try again." };
}

const refresh = () => revalidatePath("/", "layout");

export async function changeMemberRole(userId: string, role: string): Promise<FormState> {
  if (!isAdmin(await getSessionRole())) return NOT_ALLOWED;
  const id = idSchema.safeParse(userId);
  const parsed = parseRole(role);
  if (!id.success || !parsed) return { error: "Choose a role" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_user_role", { target: id.data, new_role: parsed });
  if (!error) refresh();
  return explain(error);
}

export async function setMemberName(userId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!isAdmin(await getSessionRole())) return NOT_ALLOWED;
  const id = idSchema.safeParse(userId);
  const name = displayNameSchema.safeParse(formData.get("name"));
  if (!id.success || !name.success) return { error: "Enter a name of 1 to 80 characters" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_user_name", { target: id.data, new_name: name.data });
  if (!error) refresh();
  return explain(error);
}

/** Deactivating blocks sign-in and ends the person's sessions at once. Their data stays. */
export async function setMemberActive(userId: string, active: boolean): Promise<FormState> {
  if (!isAdmin(await getSessionRole())) return NOT_ALLOWED;
  const id = idSchema.safeParse(userId);
  if (!id.success) return { error: "Choose a person" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_user_active", { target: id.data, active });
  if (!error) refresh();
  return explain(error);
}
