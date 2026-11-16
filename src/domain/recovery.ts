/** MFA recovery codes are 12 hexadecimal characters, shown as XXXX-XXXX-XXXX. */

/** Strips spaces and dashes and uppercases; returns null unless exactly 12 hex characters remain. */
export function normalizeRecoveryCode(input: string): string | null {
  const code = input.replace(/[\s-]/g, "").toUpperCase();
  return /^[0-9A-F]{12}$/.test(code) ? code : null;
}

export function formatRecoveryCode(code: string): string {
  return (code.match(/.{1,4}/g) ?? []).join("-");
}
