"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, CalendarDays, LayoutGrid, ListChecks, LayoutDashboard, ShieldCheck } from "lucide-react";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";

const NAV = [
  { href: "/", label: "Portfolio", icon: LayoutDashboard },
  { href: "/hospitals", label: "Hospitals", icon: Building2 },
  { href: "/pmo", label: "PMO", icon: ShieldCheck },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/todos", label: "To-Do", icon: ListChecks },
];

/** Left navigation rail. The active pill slides between items (shared layout animation). */
export function Rail({ footer }: { footer?: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  return (
    <aside className="rail sticky top-0 z-20 flex shrink-0 flex-row items-center gap-2 px-3 py-2 md:h-screen md:w-48 md:flex-col md:items-stretch md:gap-1 md:px-3 md:py-6">
      <div className="mb-0 flex items-center gap-2 px-2 md:mb-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white ring-1 ring-white/25">
          <LayoutGrid size={20} />
        </div>
        <span className="hidden text-sm font-bold text-white md:block">VitalBridge</span>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-row gap-1 overflow-x-auto md:flex-none md:flex-col">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "text-white" : "text-indigo-100/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="rail-active"
                  className="absolute inset-0 rounded-xl bg-[var(--pill)] shadow-lg shadow-black/25"
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon size={17} className="relative z-10 shrink-0" />
              <span className="relative z-10 hidden md:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2 md:ml-0 md:mt-auto md:flex-col md:items-stretch">{footer}</div>
    </aside>
  );
}
