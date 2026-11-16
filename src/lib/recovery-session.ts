/**
 * True when the session was opened by an emailed one-time link (password reset) rather than by typing a password.
 * The reset page and action use it so they cannot be reached as a way to change a password without knowing it.
 */
export function isRecoverySession(claims: { amr?: unknown } | null | undefined): boolean {
  const amr = claims?.amr;
  if (!Array.isArray(amr)) return false;
  return amr.some((entry) => {
    const method = (entry as { method?: unknown } | null)?.method;
    return method === "otp" || method === "recovery";
  });
}
