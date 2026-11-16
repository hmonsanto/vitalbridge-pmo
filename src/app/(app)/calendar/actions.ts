"use server";

import { z } from "zod";
import { addDependency } from "@/app/(app)/hospitals/ops-actions";
import type { FormState } from "@/app/(app)/hospitals/actions";

// Postgres accepts any 8-4-4-4-12 hex id; z.uuid() would also demand RFC version bits and reject valid ids.
const projectIdSchema = z.guid();

/** Adds an external dependency from the calendar, where the hospital is chosen in the form. */
export async function addDependencyFromCalendar(_prev: FormState, formData: FormData): Promise<FormState> {
  const projectId = projectIdSchema.safeParse(formData.get("project_id"));
  if (!projectId.success) return { error: "Select a hospital" };
  // addDependency re-checks that the caller is the owner and validates the remaining fields.
  return addDependency(projectId.data, undefined, formData);
}
