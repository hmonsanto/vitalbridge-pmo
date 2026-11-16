"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { PMO_GATES, type GateDecision } from "@/domain/gates";
import type { FormState } from "@/app/(app)/hospitals/actions";

const DECISIONS: GateDecision[] = ["go", "go_with_conditions", "replan", "stop"];

export async function decidePmoGate(projectId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if ((await getSessionRole()) !== "owner") return { error: "Not allowed" };

  const code = String(formData.get("gate") ?? "");
  const decision = String(formData.get("decision") ?? "") as GateDecision;
  if (!(PMO_GATES as readonly string[]).includes(code)) return { error: "Select a gate" };
  if (!DECISIONS.includes(decision)) return { error: "Select a decision" };
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 500) || null;

  const supabase = await createClient();
  const { error } = await supabase.from("gates").upsert(
    { project_id: projectId, code, decision, decided_on: new Date().toISOString().slice(0, 10), notes },
    { onConflict: "project_id,code" },
  );
  if (error) return { error: "Could not record the decision" };

  await recordAudit("gate_decision", "gates", `${projectId}:${code}`);
  revalidatePath("/pmo");
  revalidatePath("/");
  return { ok: true };
}

export async function createPmoProject(): Promise<void> {
  if ((await getSessionRole()) !== "owner") return;
  const supabase = await createClient();
  const { data: existing } = await supabase.from("projects").select("id").eq("kind", "pmo").maybeSingle();
  if (existing) return;

  const { data } = await supabase.from("projects").insert({ name: "PMO build-out", kind: "pmo" }).select("id").single();
  if (!data) return;
  await supabase.from("gates").insert(PMO_GATES.map((code) => ({ project_id: data.id, code })));
  await recordAudit("create", "projects", data.id);
  revalidatePath("/pmo");
}
