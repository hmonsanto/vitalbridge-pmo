"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronUp, LogOut, Moon, Sun, UserRound } from "lucide-react";
import { initials } from "@/domain/person";

const ROLE_LABEL = { owner: "Owner", viewer: "Viewer" } as const;

type Props = {
  name: string;
  role: keyof typeof ROLE_LABEL;
  signOutAction: () => void | Promise<void>;
};

const ITEM =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--track)]";

/** Who is signed in, and the personal settings that used to be loose buttons in the rail. */
export function UserMenu({ name, role, signOutAction }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Close on Escape or on a click anywhere outside the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const toggleTheme = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("vb-theme", dark ? "dark" : "light");
    } catch {
      // Storage can be unavailable (private mode); the theme still changes for this visit.
    }
  };

  return (
    <div ref={rootRef} className="relative md:w-full">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-xl bg-white/10 p-2 text-left transition-colors hover:bg-white/20 md:px-2.5"
      >
        <span
          aria-hidden
          className="font-display grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f1ece1] text-sm font-bold text-[#6b1f2a]"
        >
          {initials(name)}
        </span>
        <span className="hidden min-w-0 flex-1 md:block">
          <span data-testid="user-name" className="block truncate text-sm font-semibold text-white">{name}</span>
          <span data-testid="user-role" className="block text-[11px] text-[#f3e6d8]/70">{ROLE_LABEL[role]}</span>
        </span>
        <ChevronUp size={15} className={`hidden shrink-0 text-white/70 transition-transform md:block ${open ? "" : "rotate-180"}`} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account menu"
          className="absolute bottom-full right-0 z-30 mb-2 w-56 rounded-2xl border border-[var(--card-border)] bg-[var(--bg-base)] p-1.5 shadow-2xl shadow-black/30 md:left-0 md:right-auto md:w-full"
        >
          <div className="px-3 pb-2 pt-1.5 md:hidden">
            <p className="truncate text-sm font-semibold text-[var(--heading)]">{name}</p>
            <p className="text-[11px] text-[var(--muted)]">{ROLE_LABEL[role]}</p>
          </div>
          <Link href="/account" role="menuitem" className={ITEM} onClick={() => setOpen(false)}>
            <UserRound size={16} />
            Account
          </Link>
          <button type="button" role="menuitem" onClick={toggleTheme} className={ITEM}>
            <Moon size={16} className="dark:hidden" />
            <Sun size={16} className="hidden dark:block" />
            <span className="dark:hidden">Dark mode</span>
            <span className="hidden dark:inline">Light mode</span>
          </button>
          <form action={signOutAction}>
            <button type="submit" role="menuitem" className={`${ITEM} text-rose-600`}>
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
