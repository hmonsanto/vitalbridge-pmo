"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { canEdit } from "@/domain/roles";
import { recordAudit } from "@/lib/audit";
import { riskSchema, dependencySchema, baselineEntrySchema } from "@/lib/validation";
import type { FormState } from "./actions";

async function requireEditor(): Promise<boolean> {
  return canEdit(await getSessionRole());
}

export async function addRisk(projectId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await requireEditor())) return { error: "Not allowed" };
  const parsed = riskSchema.safeParse({
    title: formData.get("title"),
    severity: formData.get("severity"),
    status: "open",
    owner: String(formData.get("owner") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { error: "Enter a title and a severity" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("risks")
    .insert({ ...parsed.data, project_id: projectId })
    .select("id")
    .single();
  if (error || !data) return { error: "Could not add the risk" };

  await recordAudit("create", "risks", data.id);
  revalidatePath(`/hospitals/${projectId}`);
  revalidatePath("/pmo");
  revalidatePath("/");
  return { ok: true };
}

export async function addDependency(projectId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await requireEditor())) return { error: "Not allowed" };
  const parsed = dependencySchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    due_date: formData.get("due_date"),
  });
  if (!parsed.success) return { error: "Enter a title, a type and a due date" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dependencies")
    .insert({ ...parsed.data, project_id: projectId })
    .select("id")
    .single();
  if (error || !data) return { error: "Could not add the dependency" };

  await recordAudit("create", "dependencies", data.id);
  revalidatePath(`/hospitals/${projectId}`);
  revalidatePath("/pmo");
  revalidatePath("/calendar");
  revalidatePath("/");
  return { ok: true };
}

export async function markDependencyDone(projectId: string, dependencyId: string): Promise<void> {
  if (!(await requireEditor())) return;
  const supabase = await createClient();
  const { error } = await supabase.from("dependencies").update({ status: "done" }).eq("id", dependencyId);
  if (error) return;
  await recordAudit("update", "dependencies", dependencyId);
  revalidatePath(`/hospitals/${projectId}`);
  revalidatePath("/pmo");
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function addBaselineEntry(projectId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await requireEditor())) return { error: "Not allowed" };

  const month = String(formData.get("month") ?? ""); // <input type="month"> yields YYYY-MM
  const parsed = baselineEntrySchema.safeParse({
    month: /^\d{4}-\d{2}$/.test(month) ? `${month}-01` : month,
    baseline: Number(formData.get("baseline")),
    actual: Number(formData.get("actual")),
  });
  if (!parsed.success) return { error: "Enter a month and non-negative amounts" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("baseline_entries")
    .insert({ ...parsed.data, project_id: projectId })
    .select("id")
    .single();
  if (error) {
    return { error: error.code === "23505" ? "That month already has an entry" : "Could not add the entry" };
  }

  await recordAudit("create", "baseline_entries", data!.id);
  revalidatePath(`/hospitals/${projectId}`);
  revalidatePath("/pmo");
  return { ok: true };
}
