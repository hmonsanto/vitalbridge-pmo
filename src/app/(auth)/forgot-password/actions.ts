"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { emailSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export type ForgotState = { sent?: boolean; error?: string } | undefined;

/**
 * Sends a password-reset email. The answer never says whether the address has an account, and a delivery
 * failure is hidden too, so this form cannot be used to find out who has an account.
 */
export async function requestPasswordReset(_prev: ForgotState, formData: FormData): Promise<ForgotState> {
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { error: "Enter a valid email address" };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = rateLimit(`forgot:${ip}:${email.data.toLowerCase()}`, 3, 15 * 60_000);

  if (limit.allowed) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email.data); // outcome intentionally ignored
  }
  return { sent: true };
}
