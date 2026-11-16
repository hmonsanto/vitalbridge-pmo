const TONES = {
  ok: "bg-[#bfe5cf] text-[#14532d] dark:bg-emerald-900/50 dark:text-emerald-200",
  warn: "bg-[#f6dfa6] text-[#7a4b00] dark:bg-amber-900/50 dark:text-amber-200",
  danger: "bg-[#f9b9b9] text-[#7f1d1d] dark:bg-rose-900/50 dark:text-rose-200",
  info: "bg-[#d9dcff] text-[#312e81] dark:bg-indigo-900/50 dark:text-indigo-200",
} as const;

export type BadgeTone = keyof typeof TONES;

/** Pill used for statuses, severities and scenario tags. */
export function Badge({ tone = "info", children, pulse = false }: { tone?: BadgeTone; children: React.ReactNode; pulse?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${TONES[tone]} ${
        pulse ? "pulse-critical" : ""
      }`}
    >
      {children}
    </span>
  );
}
