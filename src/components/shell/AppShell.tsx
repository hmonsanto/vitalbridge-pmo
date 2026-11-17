import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { PageTransition } from "@/components/ui/PageTransition";
import { firstName } from "@/domain/person";
import { isAdmin, type Role } from "@/domain/roles";
import { CompletionCard } from "./CompletionCard";
import { Motion } from "./Motion";
import { Rail } from "./Rail";
import { UserMenu } from "./UserMenu";

type Props = {
  user: { name: string; role: Role; hasName: boolean };
  completion: { percent: number; done: number; total: number };
  signOutAction: () => void | Promise<void>;
  /** Owner has no recovery codes yet: remind them, because losing the authenticator would lock them out. */
  recoveryReminder?: boolean;
  children: React.ReactNode;
};

const today = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

/** Presentational shell: ambient background, rail, header and page transition. */
export function AppShell({ user, completion, signOutAction, recoveryReminder = false, children }: Props) {
  return (
    <Motion>
      <div className="ambient" aria-hidden />
      <div className="flex min-h-screen flex-col md:flex-row">
        <Rail
          showTeam={isAdmin(user.role)}
          footer={<UserMenu name={user.name} role={user.role} signOutAction={signOutAction} />}
        />
        <div className="min-w-0 flex-1 px-5 py-6 md:px-8">
          <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display text-[11px] font-medium uppercase italic tracking-[0.28em] text-[var(--link)]">
                Project management office
              </p>
              <h1 className="font-display mt-1 text-4xl font-bold tracking-tight text-[var(--heading)]">PMO Command Center</h1>
              <p data-testid="welcome" className="mt-1 text-sm font-medium text-[var(--text)]">
                Welcome, {firstName(user.name)}
              </p>
              {!user.hasName && (
                <Link href="/account" className="text-xs font-medium text-[var(--link)] hover:underline">
                  Add your name
                </Link>
              )}
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
