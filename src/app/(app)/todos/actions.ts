"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { todoSchema, meetingSchema } from "@/lib/validation";
import type { FormState } from "@/app/(app)/hospitals/actions";

async function requireOwner(): Promise<boolean> {
  return (await getSessionRole()) === "owner";
}

export async function addTodo(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await requireOwner())) return { error: "Not allowed" };
  const due = String(formData.get("due_date") ?? "");
  const parsed = todoSchema.safeParse({ title: formData.get("title"), due_date: due || undefined });
  if (!parsed.success) return { error: "Enter a title" };

  const supabase = await createClient();
  const { data, error } = await supabase.from("todos").insert(parsed.data).select("id").single();
  if (error || !data) return { error: "Could not add the to-do" };

  await recordAudit("create", "todos", data.id);
  revalidatePath("/todos");
  revalidatePath("/calendar");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleTodo(todoId: string, done: boolean): Promise<void> {
  if (!(await requireOwner())) return;
  const supabase = await createClient();
  const { error } = await supabase.from("todos").update({ done }).eq("id", todoId);
  if (error) return;
  await recordAudit("update", "todos", todoId);
  revalidatePath("/todos");
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function addMeeting(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await requireOwner())) return { error: "Not allowed" };
  const raw = String(formData.get("starts_at") ?? "");
  const date = new Date(raw); // datetime-local has no zone: interpreted in the server's time zone
  if (Number.isNaN(date.getTime())) return { error: "Enter a valid start time" };

  const parsed = meetingSchema.safeParse({ title: formData.get("title"), starts_at: date.toISOString() });
  if (!parsed.success) return { error: "Enter a title and a start time" };

  const supabase = await createClient();
  const { data, error } = await supabase.from("meetings").insert(parsed.data).select("id").single();
  if (error || !data) return { error: "Could not add the meeting" };

  await recordAudit("create", "meetings", data.id);
  revalidatePath("/todos");
  revalidatePath("/calendar");
  revalidatePath("/");
  return { ok: true };
}
