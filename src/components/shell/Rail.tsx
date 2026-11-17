"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, CalendarDays, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { BrandMark, BrandWordmark } from "@/components/brand/Brand";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";

const NAV = [
  { href: "/", label: "Portfolio", icon: LayoutDashboard },
  { href: "/hospitals", label: "Hospitals", icon: Building2 },
  { href: "/pmo", label: "PMO", icon: ShieldCheck },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
];

const TEAM = { href: "/team", label: "Team", icon: Users };

/** Left navigation rail. The active pill slides between items (shared layout animation). */
export function Rail({ footer, showTeam = false }: { footer?: React.ReactNode; showTeam?: boolean }) {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const items = showTeam ? [...NAV, TEAM] : NAV;
  return (
    <aside className="rail sticky top-0 z-20 flex shrink-0 flex-row items-center gap-2 px-3 py-2 md:h-screen md:w-48 md:flex-col md:items-stretch md:gap-1 md:px-3 md:py-6">
      <div className="mb-0 flex items-center gap-2.5 px-2 md:mb-7">
        <BrandMark size={38} inverse />
        <BrandWordmark inverse className="hidden text-[17px] md:block" />
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-row gap-1 overflow-x-auto md:flex-none md:flex-col">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "text-white" : "text-[#f3e6d8]/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="rail-active"
                  className="absolute inset-0 rounded-xl bg-[var(--pill)] shadow-lg shadow-black/25"
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon size={17} className={`relative z-10 shrink-0 ${active ? "text-[#e0b25a]" : ""}`} />
              <span className="relative z-10 hidden md:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2 md:ml-0 md:mt-auto md:flex-col md:items-stretch">{footer}</div>
    </aside>
  );
}
