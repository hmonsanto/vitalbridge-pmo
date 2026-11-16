"use client";

import { useId } from "react";
import { useDialogClose } from "./Dialog";

const INPUT = "w-full rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-sm text-slate-900";
const LABEL = "mb-1 block text-xs font-medium";

type InputProps = {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
  min?: string;
};

export function Field({ label, name, defaultValue, type = "text", ...rest }: InputProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <input id={id} name={name} type={type} defaultValue={defaultValue ?? ""} className={INPUT} {...rest} />
    </div>
  );
}

export function TextAreaField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string | null }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <textarea id={id} name={name} rows={3} maxLength={500} defaultValue={defaultValue ?? ""} className={INPUT} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL}>{label}</label>
      <select id={id} name={name} defaultValue={defaultValue} className={INPUT}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/** Save and Cancel buttons plus the server's error message, for forms inside a Dialog. */
export function FormFooter({
  pending,
  error,
  submitLabel = "Save changes",
  danger = false,
}: {
  pending: boolean;
  error?: string;
  submitLabel?: string;
  danger?: boolean;
}) {
  const close = useDialogClose();
  return (
    <div className="pt-1">
      {error && <p role="alert" className="mb-3 text-sm font-medium text-rose-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={close} className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium">
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
            danger ? "bg-rose-600" : "bg-[var(--accent)]"
          }`}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
