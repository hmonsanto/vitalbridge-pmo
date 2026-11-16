"use client";

import { createContext, useActionState, useContext, useEffect, useId, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { FormState } from "@/app/(app)/hospitals/actions";

const CloseContext = createContext<() => void>(() => {});

/** Lets a form inside a Dialog close it, for example after saving. */
export const useDialogClose = () => useContext(CloseContext);

/** A form action whose dialog closes by itself once the server reports success. */
export function useDialogAction(action: (prev: FormState, formData: FormData) => Promise<FormState>) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const close = useDialogClose();
  useEffect(() => {
    if (state?.ok) close();
  }, [state, close]);
  return [state, formAction, pending] as const;
}

const ICONS = { edit: Pencil, delete: Trash2 };
const TRIGGER =
  "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--track)] hover:text-[var(--heading)]";

/**
 * Icon button that opens a modal dialog (native <dialog>: focus trap and Esc come for free).
 * Its children render only while open, so every opening starts from a fresh form.
 */
export function Dialog({
  icon,
  triggerLabel,
  title,
  children,
}: {
  icon: keyof typeof ICONS;
  triggerLabel: string;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const Icon = ICONS[icon];
  const close = () => ref.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label={triggerLabel}
        title={triggerLabel}
        className={`${TRIGGER} ${icon === "delete" ? "hover:text-rose-600" : ""}`}
        onClick={() => {
          setOpen(true);
          ref.current?.showModal();
        }}
      >
        <Icon size={14} />
      </button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        className="app-dialog"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === ref.current) close(); // click on the backdrop
        }}
      >
        {open && (
          <CloseContext.Provider value={close}>
            <h3 id={titleId} className="font-display mb-4 text-xl font-bold text-[var(--heading)]">
              {title}
            </h3>
            {children}
          </CloseContext.Provider>
        )}
      </dialog>
    </>
  );
}
