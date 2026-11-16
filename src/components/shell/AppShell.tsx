import Link from "next/link";
import { LogOut, ShieldAlert, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PageTransition } from "@/components/ui/PageTransition";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CompletionCard } from "./CompletionCard";
import { Motion } from "./Motion";
import { Rail } from "./Rail";

type Props = {
  role: "owner" | "viewer";
  completion: { percent: number; done: number; total: number };
  signOutAction: () => void | Promise<void>;
  /** Owner has no recovery codes yet: remind them, because losing the authenticator would lock them out. */
  recoveryReminder?: boolean;
  children: React.ReactNode;
};

const today = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

/** Presentational shell: ambient background, rail, header and page transition. */
export function AppShell({ role, completion, signOutAction, recoveryReminder = false, children }: Props) {
  return (
    <Motion>
      <div className="ambient" aria-hidden />
      <div className="flex min-h-screen flex-col md:flex-row">
        <Rail
          footer={
            <>
              <div className="hidden justify-center md:flex">
                <Badge tone={role === "owner" ? "ok" : "info"}>{role === "owner" ? "Owner" : "Viewer"}</Badge>
              </div>
              <ThemeToggle />
              <Link
                href="/account"
                aria-label="Account"
                className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 text-xs font-medium text-white transition-colors hover:bg-white/20"
              >
                <UserRound size={15} />
                <span className="hidden md:inline">Account</span>
              </Link>
              <form action={signOutAction}>
                <button
                  aria-label="Sign out"
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 text-xs font-medium text-white transition-colors hover:bg-white/20"
                >
                  <LogOut size={15} />
                  <span className="hidden md:inline">Sign out</span>
                </button>
              </form>
            </>
          }
        />
        <div className="min-w-0 flex-1 px-5 py-6 md:px-8">
          <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display text-[11px] font-medium uppercase italic tracking-[0.28em] text-[var(--link)]">
                Project management office
              </p>
              <h1 className="font-display mt-1 text-4xl font-bold tracking-tight text-[var(--heading)]">PMO Command Center</h1>
              <p className="mt-1 text-sm font-medium text-[var(--text)]">
                Welcome, {role === "owner" ? "Project Manager" : "Viewer"}
              </p>
              <p className="text-xs text-[var(--muted)]">{today()}</p>
            </div>
            <CompletionCard {...completion} />
          </header>
          {recoveryReminder && (
            <div
              aria-label="Recovery codes reminder"
              className="glass-card mb-5 flex flex-wrap items-center gap-3 border-l-4 border-l-[var(--brand-gold)] px-4 py-3 text-sm"
            >
              <ShieldAlert size={18} className="shrink-0 text-[var(--brand-gold)]" />
              <span>You have no recovery codes. If you lose your authenticator app, you would be locked out.</span>
              <Link href="/account" className="ml-auto shrink-0 font-semibold text-[var(--link)] hover:underline">
                Generate codes
              </Link>
            </div>
          )}
          <main>
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </Motion>
  );
}
