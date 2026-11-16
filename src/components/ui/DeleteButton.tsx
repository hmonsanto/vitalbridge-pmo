"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { FormState } from "@/app/(app)/hospitals/actions";

/** Trash icon with an inline two-step confirmation ("Delete?" then "Yes, delete"), so a stray click never deletes. */
export function DeleteButton({ label, action }: { label: string; action: () => Promise<FormState> }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        aria-label={`Delete ${label}`}
        title={`Delete ${label}`}
        onClick={() => setConfirming(true)}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-rose-100 hover:text-rose-600"
      >
        <Trash2 size={14} />
      </button>
    );
  }

  return (
    <span role="group" aria-label={`Confirm delete ${label}`} className="flex shrink-0 items-center gap-1.5 text-xs">
      <span className="font-semibold text-rose-600">{error ?? "Delete?"}</span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await action();
            if (result?.error) setError(result.error);
          })
        }
        className="rounded-md bg-rose-600 px-2 py-1 font-semibold text-white disabled:opacity-60"
      >
        Yes, delete
      </button>
      <button
        type="button"
        onClick={() => {
          setConfirming(false);
          setError(undefined);
        }}
        className="rounded-md border border-[var(--border)] px-2 py-1 font-medium"
      >
        Cancel
      </button>
    </span>
  );
}
