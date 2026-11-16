"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export type TabProject = { id: string; name: string };

/**
 * One dark pill per hospital, like the project tabs in the reference.
 * Owners get the single "Add Hospital" action, pinned at the right so it stays visible
 * even when the tabs overflow and scroll.
 */
export function ProjectTabs({ projects, canCreate }: { projects: TabProject[]; canCreate: boolean }) {
  const pathname = usePathname();
  if (projects.length === 0 && !canCreate) return null;

  return (
    <div className="mb-5 flex items-center gap-3">
      <nav aria-label="Hospitals" className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
        {projects.map((p, i) => {
          const active = pathname === `/hospitals/${p.id}`;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i, 8) * 0.05, duration: 0.3 }}
              className="shrink-0"
            >
              <Link
                href={`/hospitals/${p.id}`}
                aria-current={active ? "page" : undefined}
                className={`block rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow transition-all hover:-translate-y-0.5 ${
                  active ? "bg-[var(--tab)] ring-2 ring-[#e0b25a]/70" : "bg-[var(--tab)]/75 hover:bg-[var(--tab)]"
                }`}
              >
                {p.name}
              </Link>
            </motion.div>
          );
        })}
      </nav>
      {canCreate && (
        <Link
          href="/hospitals/new"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-[#6b1f2a]/25 transition-transform hover:-translate-y-0.5"
        >
          <Plus size={14} strokeWidth={2.6} />
          Add Hospital
        </Link>
      )}
    </div>
  );
}
