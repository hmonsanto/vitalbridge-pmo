import { LogOut } from "lucide-react";
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
  children: React.ReactNode;
};

const today = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

/** Presentational shell: ambient background, rail, header and page transition. */
export function AppShell({ role, completion, signOutAction, children }: Props) {
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
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--heading)]">VitalBridge RX PMO</h1>
              <p className="mt-1 text-sm font-medium text-[var(--text)]">
                Welcome, {role === "owner" ? "Project Manager" : "Viewer"}
              </p>
              <p className="text-xs text-[var(--muted)]">{today()}</p>
            </div>
            <CompletionCard {...completion} />
          </header>
          <main>
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </Motion>
  );
}
