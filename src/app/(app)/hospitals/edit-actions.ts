"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import {
  baselineEntrySchema,
  dependencyEditSchema,
  deliverableEditSchema,
  projectSchema,
  riskSchema,
} from "@/lib/validation";
import type { FormState } from "./actions";

const NOT_ALLOWED: FormState = { error: "Not allowed" };
const SAVE_FAILED: FormState = { error: "Could not save the changes" };

const isOwner = async () => (await getSessionRole()) === "owner";
const text = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const optional = (v: FormDataEntryValue | null) => text(v) || undefined;
// Edits can touch any page (header completion, portfolio, calendar, tabs), so refresh everything.
const refresh = () => revalidatePath("/", "layout");

type Table = "deliverables" | "risks" | "dependencies" | "baseline_entries";

/** Deletes one row of a project-owned table. The project id in the filter stops a mismatched id from matching. */
async function removeRow(table: Table, projectId: string, id: string): Promise<FormState> {
  if (!(await isOwner())) return NOT_ALLOWED;
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).delete().eq("id", id).eq("project_id", projectId).select("id");
  if (error || !data?.length) return { error: "Could not delete" };
  await recordAudit("delete", table, id);
  refresh();
  return { ok: true };
}

/** Updates one row; zero affected rows (wrong id, or RLS refusing) is reported as a failure. */
async function changeRow(table: Table, projectId: string, id: string, values: Record<string, unknown>): Promise<FormState> {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).update(values).eq("id", id).eq("project_id", projectId).select("id");
  if (error || !data?.length) return SAVE_FAILED;
  await recordAudit("update", table, id);
  refresh();
  return { ok: true };
}

// ---- Hospital -------------------------------------------------------------------------------------

export async function updateHospital(projectId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isOwner())) return NOT_ALLOWED;
  const parsed = projectSchema.safeParse({ name: text(formData.get("name")), scenario: text(formData.get("scenario")), kind: "hospital" });
  if (!parsed.success) return { error: "Enter a name and choose a scenario" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ name: parsed.data.name, scenario: parsed.data.scenario })
    .eq("id", projectId)
    .eq("kind", "hospital")
    .select("id");
  if (error || !data?.length) return SAVE_FAILED;

  await recordAudit("update", "projects", projectId);
  refresh();
  return { ok: true };
}

/** Deleting a hospital also deletes everything under it, so the exact name must be typed. */
export async function deleteHospital(projectId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isOwner())) return NOT_ALLOWED;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("name").eq("id", projectId).eq("kind", "hospital").maybeSingle();
  if (!project) return { error: "Hospital not found" };
  if (text(formData.get("confirm")) !== project.name) return { error: "The name does not match. Nothing was deleted." };

  const { data, error } = await supabase.from("projects").delete().eq("id", projectId).select("id");
  if (error || !data?.length) return { error: "Could not delete the hospital" };

  await recordAudit("delete", "projects", projectId);
  refresh();
  redirect("/hospitals");
}

// ---- Deliverables ---------------------------------------------------------------------------------

export async function updateDeliverable(projectId: string, id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isOwner())) return NOT_ALLOWED;
  const parsed = deliverableEditSchema.safeParse({
    name: text(formData.get("name")),
    phase: Number(formData.get("phase")),
    owner: optional(formData.get("owner")),
    doc_url: optional(formData.get("doc_url")),
    remarks: optional(formData.get("remarks")),
  });
  if (!parsed.success) return { error: "Check the name and phase. A document link must start with http:// or https://" };

  const { name, phase, owner, doc_url, remarks } = parsed.data;
  return changeRow("deliverables", projectId, id, {
    name,
    phase,
    owner: owner ?? null,
    doc_url: doc_url ?? null,
    remarks: remarks ?? null,
  });
}

export async function deleteDeliverable(projectId: string, id: string): Promise<FormState> {
  return removeRow("deliverables", projectId, id);
}

// ---- Risks ----------------------------------------------------------------------------------------

export async function updateRisk(projectId: string, id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isOwner())) return NOT_ALLOWED;
  const parsed = riskSchema.safeParse({
    title: text(formData.get("title")),
    severity: text(formData.get("severity")),
    status: text(formData.get("status")),
    owner: optional(formData.get("owner")),
  });
  if (!parsed.success) return { error: "Enter a title, a severity and a status" };

  const { title, severity, status, owner } = parsed.data;
  return changeRow("risks", projectId, id, { title, severity, status, owner: owner ?? null });
}

export async function deleteRisk(projectId: string, id: string): Promise<FormState> {
  return removeRow("risks", projectId, id);
}

// ---- Dependencies ---------------------------------------------------------------------------------

export async function updateDependency(projectId: string, id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isOwner())) return NOT_ALLOWED;
  const parsed = dependencyEditSchema.safeParse({
    title: text(formData.get("title")),
    type: text(formData.get("type")),
    due_date: text(formData.get("due_date")),
    status: text(formData.get("status")),
  });
  if (!parsed.success) return { error: "Enter a title, a type, a due date and a status" };
  return changeRow("dependencies", projectId, id, parsed.data);
}

export async function deleteDependency(projectId: string, id: string): Promise<FormState> {
  return removeRow("dependencies", projectId, id);
}

// ---- Baseline entries (the month itself cannot change: delete and re-add instead) -------------------

export async function updateBaselineEntry(projectId: string, id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isOwner())) return NOT_ALLOWED;
  const parsed = baselineEntrySchema.pick({ baseline: true, actual: true }).safeParse({
    baseline: Number(formData.get("baseline")),
    actual: Number(formData.get("actual")),
  });
  if (!parsed.success) return { error: "Enter non-negative amounts" };
  return changeRow("baseline_entries", projectId, id, parsed.data);
}

export async function deleteBaselineEntry(projectId: string, id: string): Promise<FormState> {
  return removeRow("baseline_entries", projectId, id);
}
