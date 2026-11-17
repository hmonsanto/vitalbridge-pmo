"use client";

import { useState, useTransition } from "react";
import { Dialog, useDialogAction } from "@/components/ui/Dialog";
import { Field, FormFooter } from "@/components/ui/Field";
import { ROLES, roleLabel, type Role } from "@/domain/roles";
import { changeMemberRole, setMemberActive, setMemberName } from "./actions";

/** Changes someone's role. The change is saved at once; if the server refuses it, the old role comes back. */
export function RoleSelect({ userId, name, role }: { userId: string; name: string; role: Role }) {
  const [value, setValue] = useState(role);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  return (
    <div>
      <select
        aria-label={`Role for ${name}`}
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as Role;
          const previous = value;
          setValue(next);
          setError(undefined);
          start(async () => {
            const result = await changeMemberRole(userId, next);
            if (result?.error) {
              setValue(previous);
              setError(result.error);
            }
          });
        }}
        className="rounded-lg border border-[var(--border)] bg-white/70 px-2 py-1 text-xs text-slate-900"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{roleLabel(r)}</option>
        ))}
      </select>
      {error && <p role="alert" className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function EditNameForm({ userId, name }: { userId: string; name: string }) {
  const [state, action, pending] = useDialogAction(setMemberName.bind(null, userId));
  return (
    <form action={action} className="space-y-3">
      <Field label="Display name" name="name" defaultValue={name} required />
      <FormFooter pending={pending} error={state?.error} />
    </form>
  );
}

/** Rename, and deactivate or reactivate. Deactivating asks for a second click, because it signs the person out. */
export function MemberActions({
  userId,
  name,
  hasName,
  banned,
  isSelf,
}: {
  userId: string;
  name: string;
  hasName: boolean;
  banned: boolean;
  isSelf: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const run = (active: boolean) =>
    start(async () => {
      const result = await setMemberActive(userId, active);
      if (result?.error) setError(result.error);
      else setConfirming(false);
    });

  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-1.5">
      <Dialog icon="edit" triggerLabel={`Edit name of ${name}`} title="Edit name">
        <EditNameForm userId={userId} name={hasName ? name : ""} />
      </Dialog>

      {!isSelf && banned && (
        <button
          type="button"
          disabled={pending}
          aria-label={`Reactivate ${name}`}
          onClick={() => run(true)}
          className="rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium"
        >
          Reactivate
        </button>
      )}

      {!isSelf && !banned && !confirming && (
        <button
          type="button"
          aria-label={`Deactivate ${name}`}
          onClick={() => setConfirming(true)}
          className="rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-rose-600"
        >
          Deactivate
        </button>
      )}

      {!isSelf && !banned && confirming && (
        <span role="group" aria-label={`Confirm deactivating ${name}`} className="inline-flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-rose-600">Sign them out and block access?</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(false)}
            className="rounded-md bg-rose-600 px-2 py-1 font-semibold text-white disabled:opacity-60"
          >
            Yes, deactivate
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-md border border-[var(--border)] px-2 py-1 font-medium"
          >
            Cancel
          </button>
        </span>
      )}
      {error && <span role="alert" className="w-full text-right text-xs font-medium text-rose-600">{error}</span>}
    </span>
  );
}
