import { BrandMark, BrandWordmark } from "@/components/brand/Brand";

/** Shared frame for the signed-out screens: brand header and a glass card on the ambient background. */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="ambient" aria-hidden />
      <div className="glass-card w-full max-w-md space-y-4 p-8">
        <div className="flex items-center gap-3">
          <BrandMark size={40} />
          <BrandWordmark className="text-xl" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--heading)]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}

export const AUTH_FIELD =
  "w-full rounded-lg border border-[var(--border)] bg-white/70 px-3 py-2 text-slate-900";
export const AUTH_BUTTON =
  "w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 font-semibold text-white shadow-lg shadow-[#6b1f2a]/25 transition-transform hover:-translate-y-0.5 disabled:opacity-60";
