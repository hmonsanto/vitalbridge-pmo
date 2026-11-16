"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { projectSchema, deliverableSchema } from "@/lib/validation";
import { canAdvance, type GateDecision } from "@/domain/gates";

export type FormState = { error?: string; ok?: boolean } | undefined;

const NOT_ALLOWED: FormState = { error: "Not allowed" };

async function requireOwner(): Promise<boolean> {
  return (await getSessionRole()) === "owner";
}

export async function createHospital(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await requireOwner())) return NOT_ALLOWED;

  const name = String(formData.get("name") ?? "").trim();
  const scenario = String(formData.get("scenario") ?? "");
  if (!name) return { error: "Name is required" };
  if (!scenario) return { error: "Select a scenario" };

  const parsed = projectSchema.safeParse({ name, scenario, kind: "hospital" });
  if (!parsed.success) return { error: "Invalid hospital data" };

  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").insert(parsed.data).select("id").single();
  if (error || !data) return { error: "Could not create the hospital" };

  await supabase
    .from("gates")
    .insert(["G1", "G2", "G3", "G4", "G5"].map((code) => ({ project_id: data.id, code })));
  await recordAudit("create", "projects", data.id);

  revalidatePath("/hospitals");
  redirect(`/hospitals/${data.id}`);
}

export async function addDeliverable(projectId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await requireOwner())) return NOT_ALLOWED;

  const parsed = deliverableSchema.safeParse({
    name: formData.get("name"),
    phase: Number(formData.get("phase")),
    status: "not_started",
    owner: String(formData.get("owner") ?? "").trim() || undefined,
  });
  if (!parsed.success) return { error: "Enter a name and a phase" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deliverables")
    .insert({ ...parsed.data, project_id: projectId })
    .select("id")
    .single();
  if (error || !data) return { error: "Could not add the deliverable" };

  await recordAudit("create", "deliverables", data.id);
  revalidatePath(`/hospitals/${projectId}`);
  revalidatePath("/pmo");
  return { ok: true };
}

export async function setDeliverableStatus(projectId: string, deliverableId: string, status: string): Promise<FormState> {
  if (!(await requireOwner())) return NOT_ALLOWED;
  const parsed = deliverableSchema.shape.status.safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };

  const supabase = await createClient();
  const { error } = await supabase.from("deliverables").update({ status: parsed.data }).eq("id", deliverableId);
  if (error) return { error: "Could not update the status" };

  await recordAudit("update", "deliverables", deliverableId);
  revalidatePath(`/hospitals/${projectId}`);
  revalidatePath("/pmo");
  return { ok: true };
}

const DECISIONS: GateDecision[] = ["go", "go_with_conditions", "replan", "stop"];

export async function decideGate(projectId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await requireOwner())) return NOT_ALLOWED;

  const decision = String(formData.get("decision") ?? "") as GateDecision;
  if (!DECISIONS.includes(decision)) return { error: "Select a decision" };
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 500) || null;

  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("current_phase").eq("id", projectId).single();
  if (!project) return { error: "Hospital not found" };

  const phase = project.current_phase as number;
  const { error } = await supabase.from("gates").upsert(
    { project_id: projectId, code: `G${phase}`, decision, decided_on: new Date().toISOString().slice(0, 10), notes },
    { onConflict: "project_id,code" },
  );
  if (error) return { error: "Could not record the decision" };

  if (canAdvance(phase, decision)) {
    await supabase.from("projects").update({ current_phase: phase + 1 }).eq("id", projectId);
  }

  await recordAudit("gate_decision", "gates", `${projectId}:G${phase}`);
  revalidatePath(`/hospitals/${projectId}`);
  revalidatePath("/pmo");
  return { ok: true };
}
