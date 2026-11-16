"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Portfolio" },
  { href: "/hospitals", label: "Hospitals" },
  { href: "/pmo", label: "PMO" },
  { href: "/calendar", label: "Calendar" },
  { href: "/todos", label: "To-Do" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex gap-1 md:flex-col">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-[var(--accent)] text-white" : "text-[var(--text)] hover:bg-[var(--border)]"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
