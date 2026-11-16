"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export type TabProject = { id: string; name: string };

/** One dark pill per hospital, like the project tabs in the reference. Owners get a "+" to add one. */
export function ProjectTabs({ projects, canCreate }: { projects: TabProject[]; canCreate: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Hospitals" className="mb-5 flex flex-wrap items-center gap-2">
      {projects.map((p, i) => {
        const active = pathname === `/hospitals/${p.id}`;
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Link
              href={`/hospitals/${p.id}`}
              aria-current={active ? "page" : undefined}
              className={`block rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow transition-all hover:-translate-y-0.5 ${
                active ? "bg-[var(--pill)] ring-2 ring-white/60" : "bg-[var(--pill)]/70 hover:bg-[var(--pill)]"
              }`}
            >
              {p.name}
            </Link>
          </motion.div>
        );
      })}
      {canCreate && (
        <Link
          href="/hospitals/new"
          aria-label="New hospital"
          className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] bg-white/50 text-[var(--heading)] transition-transform hover:rotate-90 dark:bg-white/10"
        >
          <Plus size={15} />
        </Link>
      )}
    </nav>
  );
}
