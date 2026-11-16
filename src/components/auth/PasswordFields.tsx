"use client";

import { AUTH_FIELD } from "./AuthCard";

/** New password and its confirmation, shared by the reset page and the account page. */
export function PasswordFields({ prefix }: { prefix: string }) {
  return (
    <>
      <div>
        <label htmlFor={`${prefix}-new`} className="mb-1 block text-sm font-medium">New password</label>
        <input
          id={`${prefix}-new`}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          required
          className={AUTH_FIELD}
        />
        <p className="mt-1 text-xs text-[var(--muted)]">At least 12 characters. A long phrase is easier to remember and stronger.</p>
      </div>
      <div>
        <label htmlFor={`${prefix}-confirm`} className="mb-1 block text-sm font-medium">Confirm new password</label>
        <input
          id={`${prefix}-confirm`}
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className={AUTH_FIELD}
        />
      </div>
    </>
  );
}
